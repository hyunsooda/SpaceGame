import All from './basicSetting';

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
      Common = All.M.Common,
      Vertices = All.M.Vertices,
      Svg = All.M.Svg;

      

const Arrow = ( () => {
    let bodies = [];

    return class {
        constructor(direction,x,y) {
            this.body = this.init(direction,x,y);
            bodies.push(this.body);
        }
        init(direction,x,y) {
            const renderOption = {
                    label : 'arrow'
                  },
                  path = (direction === 'right') ? [0, 0, 100, 0, 100, -20, 120, 10, 100, 40, 100, 10, 0, 10, 0, 0] : [0, 0, -100, 0, -100, -20, -120, 10, -100, 40, -100, 10, 0, 10, 0, 0],
                  body = Bodies.fromVertices(x,y,Vertices.fromPath('0 0 100 0 100 -20 120 10 100 40 100 10 0 10 0 0'),renderOption,true);

            return {
                body : body,
                path : path
            };
        }
    }
})();

const Flight = ( () => {

    return class {
        constructor(x,y) {
            this.init(x,y);
        }
        init(x,y) {
            this.path = document.querySelector('svg path');
            this.body = Bodies.fromVertices(x,y,Svg.pathToVertices(this.path,15),{
                label : 'flight',
                link : './images/flight.png',
            },false);
        }
    }
})();






export {
    Arrow,
    Flight
}
