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

### Deploy
Change the ProjectID of `"deploy": "npm run build && gcloud app deploy --project {your-project-id}"` in `package.json` for your environment.
```
$ npm run deploy
```
