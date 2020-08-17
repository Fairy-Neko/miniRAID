Please refer to https://updatestage.com/create-a-phaser-3-project-part-1/ for build up the enviorment, phaser and typescript.  

Basically, you need to:  
1. `git clone --recursive path/to/this/repo.git`  
or if you forgot the `--recursive`, run `git submodule update --init --recursive` inside the root folder to get the submodules inited.  
2. `npm i` to install dependencies.  
3. `tsc` to run the typescript compiler. It will keep running and detect any changes, which will trigger a re-compile.  
4. The compiled javascript and html files will be in `bin/` and a HTML `bin/index.html`.  

You can view the docs under `docs/index.html`.  
To generate the docs, first install `typedoc` then `npx typedoc` under the root folder.

### TODOs

* (OK) Add cooldown timer related things (1 timer is okay) to MobListener base class
* Move attack speed timer from Mob to Weapon (using MobListener cooldown timer API)
* Let MobListener able to listen to MobListeners (e.g. char listen to weapon, team buff listen to all player's weapon)
* Let testGirl attack the woodLog with a fireball (which applies a burnt debuff) !
