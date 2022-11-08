**We are making a turn-based tactical RPG for miniRAID instead. Please check [miniRAIDs](https://fairy-neko.github.io/miniRAIDs).**  

------

Please refer to e.g. https://www.freecodecamp.org/news/how-to-build-a-simple-game-in-the-browser-with-phaser-3-and-typescript-bdc94719135/ for build up the enviorment, phaser and typescript.  
I used NPM as the package manager.

Basically, you need to:  
1. `git clone --recursive path/to/this/repo.git`  
or if you forgot the `--recursive`, run `git submodule update --init --recursive` inside the root folder to get the submodules inited.  
2. `npm i` to install dependencies.  
3. `tsc` to run the typescript compiler. It will keep running and detect any changes, which will trigger a re-compile.  
4. The compiled javascript and html files will be in `bin/` and a HTML `bin/index.html`.  

You can view the docs under `docs/index.html`.  
To generate the docs, first install `typedoc` then `npx typedoc` under the root folder.  

### Github Pages

* [https://fairy-neko.github.io/miniRAID/bin/](https://fairy-neko.github.io/miniRAID/bin/) to play the game
* [https://fairy-neko.github.io/miniRAID/docs/](https://fairy-neko.github.io/miniRAID/docs/) for documentations.

### TODOs

* Let MobListener able to listen to MobListeners (e.g. char listen to weapon, team buff listen to all player's weapon)
* ~~Let testGirl attack the woodLog with a fireball~~ (which applies a burnt debuff) !
