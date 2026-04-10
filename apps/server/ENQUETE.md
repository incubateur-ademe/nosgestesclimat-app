Pour récupérer les données de l'enquête, voici la procédure.

```
scalingo --app nosgestesclimat-pr9 run "NODE_OPTIONS=--max-old-space-size=1536 node exportSimulations.js &> /dev/null && cat export/simulations-21-04-2023.csv" > simu.csv
```
