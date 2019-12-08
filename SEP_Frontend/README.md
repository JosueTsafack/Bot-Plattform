# Ordnerstruktur

- <code>client/</code> enthält den Frontend Client, aufgeteilt in
  - <code>components/</code>
    - <code>App.vue</code> die Hauptdatei über die der Client gestartet wird
  - <code>router/</code>
    - <code>index.js</code> enthält Routeranbindungen auf die verschiedenen views (siehe unten)
  - <code>store/</code>
    - <code>actions.js</code> enthält die GET/POST-Request Funktionen
    - <code>getter.js</code> enthält alle getter Funktionen um Daten aus state.js zu erhalten
    - <code>mutations.js</code> enthält Funktionen die Variablen in state.js setzen (Setter)
    - <code>state.js</code> enthält alle Variablen die im Client verfügbar sein müssen
  - <code>views/</code>
    - <code>config.vue</code> ist der spätere Bot-Konfigurator
    - <code>create.vue</code> ist die spätere Bot-Erstellung
    - <code>links.vue</code> ist ein Menu welches nur in der Entwicklung enthalten ist und verlinkungen zu den einzelnen views anzeigt
    - <code>marketplace.vue</code> ist der spätere Bot-Marketplace
    - <code>overview.vue</code> ist die spätere Bot-Runtime
- <code>docs/</code> enthält nur das Issue Template
- <code>static/</code> enthält alle vom Client verwendeten Bilder
- <code>test/</code> enthält Testdateien


# Starting
+ navigate to SEP_Frontend folder and run <code>node build/server.js --define process.env.NODE_ENV='production'/</code> to start the frontend server
