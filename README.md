# Russian Bank [![CodeQL](https://github.com/RheaMars/russian-bank/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/RheaMars/russian-bank/actions/workflows/codeql-analysis.yml) [![Docker Image CI](https://github.com/RheaMars/russian-bank/actions/workflows/docker-image.yml/badge.svg)](https://github.com/RheaMars/russian-bank/actions/workflows/docker-image.yml) [![Node.js CI](https://github.com/RheaMars/russian-bank/actions/workflows/node.js.yml/badge.svg)](https://github.com/RheaMars/russian-bank/actions/workflows/node.js.yml)

A solitaire card playing game for one player, based on the version available at [https://zankpatience.net](https://zankpatience.net).

## Prerequisites and Setup
There are 2 ways to setup with different prerequisites, easiest way should be docker:

### Docker
- Install docker for your OS [Docker](https://www.docker.com/)

(the names `russianbank` and `russianbank-demo` are just examples and free to choose)

1. Checkout the repository
2. Create image `russianbank`:
```
# docker build -t russianbank .
```
3. Create and run container `russianbank-demo`:
```
# docker run --name russianbank-demo -p 8080:80 -d russianbank
```
4. Call [http://127.0.0.1:8080/app/pages/game.html](http://127.0.0.1:8080/app/pages/game.html)) 
5. Have fun playing the game

### Development environment
- [Node.js](https://nodejs.org/en/)
- A JS package manager (e.g. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/))
- [Webpack](https://webpack.js.org/)
- Any webserver (e.g. Apache or NGINX)

1. Checkout the repository
2. Install the external JS libraries listed in the `package.json` file, e.g. by running 
```
# npm install
```
3. Run 
```
# webpack
```
to generate the bundeled JS file in the `app/js/dist` directory

4. Call the `index.html` file in the browser of your choice
5. Have fun playing with the code and the game
