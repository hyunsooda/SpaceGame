import All from './basicSetting';
import { PhysicsRender , utilControl, anim, gameHelper } from './classes'

const app = All.P.app,
      ctx = All.ctx,
      canvas = All.canvas,
      entireWidth = All.entireWidth,
      entireHeight = All.entireHeight,
      Matter = All.Matter,
      World = All.M.World,
      world = All.M.world,
      engine = All.M.engine,
      Bodies = All.M.Bodies,
      Composite = All.M.Composite,
      Body = All.M.Body,
      Common = All.M.Common;




// init
window.setTimeout(() => {
    PhysicsRender.renderStart();  // render start.
    gameHelper.collision(); // collsion check
},10000)







