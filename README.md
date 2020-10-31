![master build](https://github.com/planetsolutions/pa-front/workflows/master%20build/badge.svg)
![publish release](https://github.com/planetsolutions/pa-front/workflows/publish%20release/badge.svg)
![publish test](https://github.com/planetsolutions/pa-front/workflows/publish%20test/badge.svg)

# PlanetArchive Frontend Application
Uses Angular 5 framework and NPM.

Simple build:
```
npm install
ng build
```
Production build:
```
ng build --output-hashing=bundles --prod --aot=false --build-optimizer=false
```
