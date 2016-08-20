/*
    (original)
    ts-node ver.0.7.3
    node_modules/ts-node/dist/ts-node.js
*/

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var path_1 = require('path');
var fs_1 = require('fs');
var os_1 = require('os');
var sourceMapSupport = require('source-map-support');
var extend = require('xtend');
var arrify = require('arrify');
var make_error_1 = require('make-error');
var pkg = require('../package.json');
exports.VERSION = pkg.version;
exports.EXTENSIONS = ['.ts', '.tsx'];
function readConfig(options, cwd, ts) {
    var project = options.project, noProject = options.noProject;
    var fileName = noProject ? undefined : ts.findConfigFile(project || cwd, ts.sys.fileExists);
    var result = fileName ? ts.readConfigFile(fileName, ts.sys.readFile) : {
        config: {
            files: [],
            compilerOptions: {}
        }
    };
    if (result.error) {
        throw new TSError([formatDiagnostic(result.error, ts)]);
    }
    result.config.compilerOptions = extend({
        /* 
            commentted out to enable "allowSyntheticDefaultImports" feature.
        */
        // target: 'es5',
        // module: 'commonjs'
    }, result.config.compilerOptions, {
        sourceMap: false,
        inlineSourceMap: true,
        inlineSources: true,
        declaration: false,
        noEmit: false
    });
    var basePath = fileName ? path_1.dirname(path_1.resolve(fileName)) : cwd;
    if (typeof ts.parseConfigFile === 'function') {
        return ts.parseConfigFile(result.config, ts.sys, basePath);
    }
    return ts.parseJsonConfigFileContent(result.config, ts.sys, basePath, null, fileName);
}
var DEFAULT_OPTIONS = {
    getFile: getFile,
    getVersion: getVersion,
    disableWarnings: process.env.TS_NODE_DISABLE_WARNINGS,
    compiler: process.env.TS_NODE_COMPILER,
    project: process.env.TS_NODE_PROJECT || process.cwd(),
    noProject: process.env.TS_NODE_NO_PROJECT,
    ignoreWarnings: process.env.TS_NODE_IGNORE_WARNINGS
};
function register(opts) {
    var cwd = process.cwd();
    var options = extend(DEFAULT_OPTIONS, opts);
    var project = { version: 0, files: {}, versions: {} };
    options.compiler = options.compiler || 'typescript';
    options.ignoreWarnings = arrify(options.ignoreWarnings).map(Number);
    var ts = require(options.compiler);
    var config = readConfig(options, cwd, ts);
    if (!options.disableWarnings && config.errors.length) {
        throw new TSError(config.errors.map(function (d) { return formatDiagnostic(d, ts); }));
    }
    for (var _i = 0, _a = config.fileNames; _i < _a.length; _i++) {
        var fileName = _a[_i];
        project.files[fileName] = true;
    }
    var serviceHost = {
        getScriptFileNames: function () { return Object.keys(project.files); },
        getProjectVersion: function () { return String(project.version); },
        getScriptVersion: function (fileName) { return incrementFile(fileName); },
        getScriptSnapshot: function (fileName) {
            var contents = options.getFile(fileName);
            return contents == null ? undefined : ts.ScriptSnapshot.fromString(contents);
        },
        getNewLine: function () { return os_1.EOL; },
        getCurrentDirectory: function () { return cwd; },
        getCompilationSettings: function () { return config.options; },
        getDefaultLibFileName: function (options) { return ts.getDefaultLibFilePath(config.options); }
    };
    var service = ts.createLanguageService(serviceHost);
    sourceMapSupport.install({
        environment: 'node',
        retrieveFile: function (fileName) {
            if (project.files[fileName]) {
                return getOutput(fileName);
            }
        }
    });
    function incrementAndAddFile(fileName) {
        project.files[fileName] = true;
        var currentVersion = project.versions[fileName];
        var newVersion = incrementFile(fileName);
        if (currentVersion !== newVersion) {
            project.version++;
        }
        return newVersion;
    }
    function incrementFile(fileName) {
        var version = options.getVersion(fileName);
        project.versions[fileName] = version;
        return version;
    }
    function getOutput(fileName) {
        var output = service.getEmitOutput(fileName);
        var diagnostics = getDiagnostics(service, fileName, options, ts);
        if (output.emitSkipped) {
            diagnostics.push(path_1.relative(cwd, fileName) + ": Emit skipped");
        }
        if (diagnostics.length) {
            throw new TSError(diagnostics);
        }
        return output.outputFiles[0].text;
    }
    function compile(fileName) {
        incrementAndAddFile(fileName);
        return getOutput(fileName);
    }
    function loader(m, fileName) {
        incrementAndAddFile(fileName);
        return m._compile(getOutput(fileName), fileName);
    }
    function getTypeInfo(fileName, position) {
        incrementAndAddFile(fileName);
        var info = service.getQuickInfoAtPosition(fileName, position);
        var name = ts.displayPartsToString(info ? info.displayParts : []);
        var comment = ts.displayPartsToString(info ? info.documentation : []);
        return { name: name, comment: comment };
    }
    exports.EXTENSIONS.forEach(function (extension) {
        require.extensions[extension] = loader;
    });
    return { compile: compile, getTypeInfo: getTypeInfo };
}
exports.register = register;
function getVersion(fileName) {
    return String(fs_1.statSync(fileName).mtime.getTime());
}
exports.getVersion = getVersion;
function getFile(fileName) {
    try {
        return fs_1.readFileSync(fileName, 'utf8');
    }
    catch (error) {
        return;
    }
}
exports.getFile = getFile;
function getDiagnostics(service, fileName, options, ts) {
    if (options.disableWarnings) {
        return [];
    }
    return ts.getPreEmitDiagnostics(service.getProgram())
        .filter(function (diagnostic) {
        return options.ignoreWarnings.indexOf(diagnostic.code) === -1;
    })
        .map(function (diagnostic) {
        return formatDiagnostic(diagnostic, ts);
    });
}
function formatDiagnostic(diagnostic, ts, cwd) {
    if (cwd === void 0) { cwd = '.'; }
    var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    if (diagnostic.file) {
        var path = path_1.relative(cwd, diagnostic.file.fileName);
        var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
        return path + " (" + (line + 1) + "," + (character + 1) + "): " + message + " (" + diagnostic.code + ")";
    }
    return message + " (" + diagnostic.code + ")";
}
var TSError = (function (_super) {
    __extends(TSError, _super);
    function TSError(diagnostics) {
        _super.call(this, "\u2A2F Unable to compile TypeScript\n" + diagnostics.join('\n'));
        this.name = 'TSError';
        this.diagnostics = diagnostics;
    }
    return TSError;
}(make_error_1.BaseError));
exports.TSError = TSError;
//# sourceMappingURL=ts-node.js.map