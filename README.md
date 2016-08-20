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

### Deploy to Google Cloud Platform
Change the ProjectID of `"deploy": "npm run build && gcloud app deploy --project {your-project-id}"` in `package.json` for your environment.
```
$ npm run deploygcp
```

### Deploy to Azure App Service
```
$ npm run deployazure
```
