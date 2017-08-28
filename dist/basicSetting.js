import * as PIXI from 'pixi.js';
import 'pixi-spine';
import Matter from 'matter-js'
import 'pixi-display';
//import 'pixi-display-layers'; // https://github.com/pixijs/pixi-display/tree/layers
// 기본 셋팅 


let entireWidth = document.documentElement.clientWidth,
    entireHeight = document.documentElement.clientHeight;

const app = new PIXI.Application();
//app.renderer = new PIXI.CanvasRenderer(entireWidth,entireHeight);
app.renderer = PIXI.autoDetectRenderer(entireWidth,entireHeight);   // for Mesh


window.setTimeout( () => {
    document.body.appendChild(app.view);
},10000);

app.stage.displayList = new PIXI.DisplayList();


// module aliases
const Engine = Matter.Engine,
      Runner = Matter.Runner,
      Composites = Matter.Composites,
      Composite = Matter.Composite,
      Events = Matter.Events,
      Constraint = Matter.Constraint,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Vertices = Matter.Vertices,
      Common = Matter.Common,
      Svg = Matter.Svg,
      Vector = Matter.Vector,
      Query = Matter.Query;


const engine = Engine.create(),
      world = engine.world;

Engine.run(engine);

const canvas = app.view;
const ctx = app.view.getContext('2d'); 
canvas.style.position = 'absolute';
canvas.style.left = 0;
canvas.style.top = 0;

const mouse = Mouse.create(canvas),
      mouseConstraint = MouseConstraint.create(engine,{
          mouse : mouse,
          constraint : {
              stiffness : 0.05
          }
      });

World.add(world,mouseConstraint);

( function () {
    const wf = document.createElement('script');
    wf.src = ('https:' === document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

window.WebFontConfig = {
    google: {
        families: ['Architects Daughter','Patrick Hand']
        //families: ['Baloo Bhaijaan' , 'Snippet']
    }
};

window.onresize = () => {
    entireWidth = document.documentElement.clientWidth;
    entireHeight = document.documentElement.clientHeight;
    app.view.width = entireWidth;
    app.view.Height = entireHeight;
    app.renderer.resize(entireWidth,entireHeight);
}


export default {
    Matter : Matter,
    PIXI : PIXI,
    M : {
        Engine : Engine,
        Runner : Runner,
        Composite : Composite,
        Composites : Composites,
        Events : Events,
        Constraint : Constraint,
        MouseConstraint : MouseConstraint,
        Mouse : Mouse,
        World : World,
        Bodies : Bodies,
        Query : Query,
        Body : Body,
        Vertices : Vertices,
        Common : Common,
        Body : Body,
        Svg : Svg,
        Vector : Vector,
        world : world,
        engine : engine,
        mouse : mouse,
        mouseConstraint : mouseConstraint,
    },
    P : {
        app : app
    },
    canvas : canvas,
    ctx : ctx,
    entireWidth : entireWidth,
    entireHeight : entireHeight
}

