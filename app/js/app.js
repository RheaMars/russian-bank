import "babel-polyfill";

import * as RenderService from "./services/render_service";
import * as i18nService from "./services/i18n_service";

import {Game} from "./game";

RenderService.preloadImages();

i18nService.setupApp();
RenderService.setupApp();

const game = new Game();
game.initializeGame();
RenderService.setupLocalStorageFields(game);
