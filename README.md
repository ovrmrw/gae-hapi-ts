# gae-hapi-ts
Hapi with TypeScript on Google App Engine


### Setup
```
$ npm install && npm run overwrite
```

### Run (on local server)
```
$ npm run ts
```

### Deploy to Google App Engine
Change the ProjectID of `"deploy": "npm run build && gcloud app deploy --project {your-project-id}"` in `package.json` for your environment.
```
$ npm run deploy
```

### Deploy to Azure App Service