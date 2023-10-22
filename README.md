# Patentcloud generate statistics
## start
edit `src/index.ts` to change settings
```
npm install
npm run build
npm run start
```


## settings
### projectName
your project name

### session
your patentcloud logined session  
at `DevTools -> app -> cookie -> SESSION`

### url
your statistics-chart page


### keywords
type: `["name", "vue-i18n-txt"][]`
  * `name`: custom output name
  * `vue-i18n-txt`: statistics-chart page search options attr (use Devtools to find it)

### executablePath
browser executable path

### headless
enable browser headless