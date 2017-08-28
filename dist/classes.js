import All from './basicSetting';
import './PIXI_CustomBaseCloth';
import { Arrow, Flight } from './rigidbody';
import customEvents from './customEvents';

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
      Events = All.M.Events,
      Query = All.M.Query,
      backgroundWidth = 2500;

// global var
const left = 37,
      up = 38,
      right = 39,
      down = 40;


let anim,
    keyValue,
    backupKeyValue,
    lastKeyValue,
    keyInputPrevent,
    freeze = false,
    rightOptical,
    leftOptical,
    relocationInit = true,
    firstException = true,
    back1 = 0,
    back2 = backgroundWidth,
    sharpException = {
        incur : false,
        location : 0,
        who : undefined
    },
    aim,
    aimPoint,
    aimDegreeTmp,
    prevFlip,
    upFlag,
    downFlag,
    max,
    flyingArrow;
    


PIXI.loader.add('spine','images/hero.json').load( (loader,resources) => {
    let tmp;

    anim = new PIXI.spine.Spine(resources.spine.spineData);
    anim.x = entireWidth/7;
    anim.y = entireHeight - 80;
    app.stage.addChild(anim);
    anim.state.setAnimation(0,'idle',true);
    anim.state.timeScale = 0.5;
    prevFlip = anim.skeleton.flipX;

    tmp = PhysicsRender.init();
    aim = tmp[0];
    aimPoint = tmp[1];

    aim.position.x = anim.x + 200;
    aim.position.y = anim.y - 200;
    aimPoint.position.x = anim.x + 220;
    aimPoint.position.y = anim.y - 200;
    aimPoint.degree = 0;
    aimPoint.moveX = 0;
    aimPoint.moveY = 0;

    app.stage.addChild(aim);
    app.stage.addChild(aimPoint);
})


const PhysicsRender = ( () => {
    let bodyNums = 0;
    let bodies = [];

    return class {
        constructor(body,width,height,fillStyle,lineStyle) {
            const r =  Math.random() * 0x80 | 0,
                  g =  Math.random() * 0x80 | 0,
                  b =  Math.random() * 0x80 | 0;

            this.p = body;

            this.shape = new PIXI.Graphics();
            this.shape.beginFill( fillStyle || (r << 16) + (g << 8) + b, 1.0 , 1.0 );
            this.shape.lineStyle( Math.random() * 3 | 0, lineStyle || (r << 15) + (g << 8) + b, 1.0 );
            
            if(Object.getPrototypeOf(body) === Arrow.prototype) {  // instance of 와 같음.
                let path = [],
                    tmp = body.body.path,
                    rotation = anim.skeleton.flipX ? -Math.abs(aim.rotation) : Math.abs(aim.rotation),
                    direction = anim.skeleton.flipX;
               
                body = body.body.body;
                flyingArrow = body;

                Body.setVelocity(body,{   // x는 로테이션값이 작을수록 커지고 y는 클수록 커짐
                    x : ( () => {
                        let x = anim.skeleton.flipX ? -Math.abs(aim.rotation) : Math.abs(aim.rotation);
                        let ret;
  
                        if(anim.skeleton.flipX) {
                            if(x >= -0.02) 
                                x = -0.1;
                        }
                        else if(x <= 0.02)       
                            x = 0.1;
                        
                        ret = (anim.skeleton.flipX) ? 0.05/x*10-15 : 0.05/x*10+15;
                        return ret;
                    })(),
                    y : -Math.abs(aim.rotation)*20 
                });

                window.setTimeout( function mini() {
                    if(direction) { // left    
                        if(body.angle < rotation) 
                            return;
                        Body.rotate(body,-0.02);
                    } else { // right
                        if(body.angle > rotation) 
                            return;                    
                        Body.rotate(body,0.02);
                    }
                    window.requestAnimationFrame(mini);
                },300);

                Body.rotate(body,aim.rotation);
                
                for(let i=0,j=0; i<tmp.length/2; j+=2 ) {
                    path.push([ tmp[j] , tmp[j+1] ])
                    i++;
                }

                this.shape.moveTo( path[0][0], path[0][1] );
                path.shift();

                for(let i=0; i<path.length; i++) {
                    const p = path[i];
                    this.shape.lineTo(p[0],p[1]);
                }

            } else if(Object.getPrototypeOf(body) === Flight.prototype) {
                body = body.body;
                
            } else {
                this.shape.drawRect(0,0,width,height);
                this.shape.endFill();
            }

            if(body.label === 'basicMonster') {
                this.body = new PIXI.Sprite.fromImage(body.link);
                body.physics.push(body);
                body.sprite.push(this.body);
            } else if(body.label === 'flight') {
                this.body = new PIXI.Sprite.fromImage(body.link);
            } else if(body.label === 'lastUnit') {
                const cloth = new PIXI.CustomBaseCloth(4,4,20, PIXI.Texture.fromImage(body.link)); 
                this.body = cloth.mesh;
                body.sprite.push(cloth.mesh);
                body.originalVertices.push(cloth.orgVertices);
            } else {
                this.body = new PIXI.Sprite(this.shape.generateCanvasTexture());
            }

            if(this.body.anchor) 
                this.body.anchor.set(0.5,0.5);
            
            this.body.position.x = body.position.x;
            this.body.position.y = body.position.y;

            bodies.push(new Map());
            bodies[bodyNums].set('physics',body);
            bodies[bodyNums].set('body',this.body);

            World.add(world,body);
            bodyNums++;
        }
        // drawing confirmation
        add() {
            app.stage.addChild(this.body);            
        }
        static renderStart() {
            utilControl.pages = 0;
            app.ticker.add( () => { 
                if(anim) {
                    let level = gameHelper.getGameLevel();
                    gameHelper.setGameLevel(utilControl.levelUp(level));
                    utilControl.tailorToView();
                    Archor.drawAim();
                    Archor.fadeArrow();

                    switch(level) {
                        case 0 : gameHelper.createBasicMonster();
                        break;
                        case 1 : gameHelper.createFlight();
                        break;
                        case 2 : gameHelper.createLastUnit();
                        break;
                    }
                    gameHelper.moving();               
                }
                for(let body of bodies) {
                    const b = body.get('body');
                    const p = body.get('physics');

                    if(!b.anchor) {
                        b.position.x = p.position.x - 25;
                        b.position.y = p.position.y;
                    } else {
                        b.position.x = p.position.x;
                        b.position.y = p.position.y;
                    }
                    b.rotation = p.angle;
                }
            });
        }
        static init() {
            const g = new PIXI.Graphics(),
                  g2 = new PIXI.Graphics();
            let sprite,sprite2;

            g.beginFill(0xFFFFFF);
            g.drawRect(0,0,40,3);
            g.endFill();
            g2.beginFill(0xFAD123);
            g2.drawCircle(0,0,3);
            g2.endFill();

            sprite = new PIXI.Sprite(g.generateCanvasTexture());
            sprite.anchor.set(0.5,0.5);
            sprite2 = new PIXI.Sprite(g2.generateCanvasTexture());
            sprite2.anchor.set(0.5,0.5);

            return [sprite,sprite2];
        }
        static getAllBodies() {
            return bodies;
        }
        static getNums() {
            return bodyNums;
        }
        static remove(p,s) {
            let body;
            for(let i=0; i<bodies.length; i++) {
                body = bodies[i].get('physics');
                if(body === p) {
                    bodies.splice(i,1);
                    bodyNums--;
                }
            }

            World.remove(world,p);
            app.stage.removeChild(s);
        }
    }
})();


class utilControl {
    static levelUp(level) {
        if(this.pages > level) {
            switch(level) {
                case 0 : gameHelper.basicMonsterAllClear();
                break;
                case 1 : gameHelper.flightAllClear(); 
                break;
                case 2 : {
                    gameHelper.lastUnitClear();
                    gameHelper.collsionOff();
                    gameHelper.gameOver();
                }
                break;
            }
            return level+1;
        } else 
            return level;
    }
    static getPages() {
        return this.pages;
    }
    // 타일스크롤링
    static tailorToView() {    
        const compo = Composite.allBodies(engine.world);
        let i = 1,
            confirmation;

        if(anim.x > entireWidth/1.5 && keyValue === right) {
            rightOptical = true;
            confirmation = 'right';
        } else if(anim.x < entireWidth/4 && keyValue === left) {
            leftOptical = true;
            confirmation = 'left';
        } else {
            leftOptical = rightOptical = false;
            return;
        }        

        if(back1 === backgroundWidth) {
            back1 = -backgroundWidth-Math.abs(back2);

            sharpException.incur = true;
            sharpException.location = -backgroundWidth;
            sharpException.who = 'back1';
            this.pages--;
        } else if(back1 === -backgroundWidth) {
            back1 = backgroundWidth-Math.abs(back2);

            sharpException.incur = true;
            sharpException.location = backgroundWidth;
            sharpException.who = 'back1';
            this.pages++;
            
        }

        if(back2 === backgroundWidth){
            back2 = -backgroundWidth-Math.abs(back1);

            sharpException.incur = true;
            sharpException.location = -backgroundWidth;
            sharpException.who = 'back2';
            this.pages--;
                
        } else if(back2 === -backgroundWidth) {
            //back2 = backgroundWidth;
            back2 = backgroundWidth-Math.abs(back1);

            sharpException.incur = true;
            sharpException.location = backgroundWidth;
            sharpException.who = 'back2';

            if(this.pages !== 0)
                this.pages++;
        }

        // 배치바꾸기(맨처음에만)
        if(relocationInit && leftOptical) {
            back2 = -backgroundWidth;
            relocationInit = false;
        }
        relocationInit = false; 
        //
        
        if(sharpException.incur) {
            if(sharpException.who === 'back1') {  // back1
                if( (sharpException.location === backgroundWidth) && leftOptical) 
                    back1 = -backgroundWidth;           
                else if( (sharpException.location === -backgroundWidth) && rightOptical)
                    back1 = backgroundWidth;
            } else { // back2
                if( (sharpException.location === backgroundWidth) && leftOptical) 
                    back2 = -backgroundWidth;
                else if( (sharpException.location === -backgroundWidth) && rightOptical)
                    back2 = backgroundWidth;
            }
            
            sharpException.incur = false;
            sharpException.who = undefined;
            sharpException.location = 0;
        }
        
        background.setTransform(back1  ,0,background.scale.x,background.scale.y);    
        background2.setTransform(back2 , 0, background2.scale.x, background2.scale.y); 
        
        if(confirmation === 'right' ) {
            back1-=4;
            back2-=4;
        } else if(confirmation === 'left' ) {
            back1+=4;
            back2+=4;
        }
    }
}

class Archor {
    static drawAim() {
        const tmp = {
            rotation : aim.rotation,
            degree : aimPoint.degree,
            moveX : aimPoint.moveX,
            moveY : aimPoint.moveY
        };
        let preventDownArrow = false;

        if(keyInputPrevent) return;

        if(lastKeyValue === left) {
            if(anim.skeleton.flipX !== prevFlip) {
                if(aimPoint.degree > 0) aimPoint.degree = -180 - aimPoint.degree;
                else aimPoint.degree = -180 + Math.abs(aimPoint.degree);
                            
                aim.rotation = -aim.rotation;
            }
            prevFlip = true;
        } else if(lastKeyValue === right) {     
            if(anim.skeleton.flipX !== prevFlip) {
                if(aimPoint.degree > -180)  aimPoint.degree = -180 + Math.abs(aimPoint.degree);
                else aimPoint.degree = Math.abs(aimPoint.degree) - 180;
                            
                aim.rotation = -aim.rotation;
            }
            prevFlip = false;
        }

        if(upFlag) {                        
            if(!anim.skeleton.flipX) {  // right (부호만 바뀜)
                max = -(Math.PI/180 * 90);
                            
                if(aim.rotation >= max) {
                    aim.rotation -= Math.PI/180 * 1;
                    aimPoint.degree -= 1;
                } 
            } else { // left
                max = (Math.PI/180 * 90);

                if(aim.rotation <= max) {
                    aim.rotation += Math.PI/180 * 1;
                    aimPoint.degree += 1;  
                } 
            }
                        
            aimPoint.moveX = (Math.cos( Math.PI/180 * aimPoint.degree) * 20);
            aimPoint.moveY = (Math.sin(  Math.PI/180 * aimPoint.degree) * 20);  
            aimPoint.position.x = aimPoint.moveX + aim.position.x;
            aimPoint.position.y = aimPoint.moveY + aim.position.y; 
        }

        if(downFlag) {         
            if(!anim.skeleton.flipX) {  // right (부호만 바뀜)
                if(aim.rotation > 0) preventDownArrow = true;;

                max = Math.PI/180 * 90;
                            
                if(aim.rotation <= max) {
                    aim.rotation += Math.PI/180 * 1;
                    aimPoint.degree += 1;
                } 
            } else { // left
                if(aim.rotation < 0) preventDownArrow = true;;

                max = -(Math.PI/180 * 90);

                if(aim.rotation >= max) {
                    aim.rotation -= Math.PI/180 * 1;
                    aimPoint.degree -= 1;  
                } 
            }
                        
            aimPoint.moveX = (Math.cos( Math.PI/180 * aimPoint.degree) * 20);
            aimPoint.moveY = (Math.sin(  Math.PI/180 * aimPoint.degree) * 20);  
            aimPoint.position.x = aimPoint.moveX + aim.position.x;
            aimPoint.position.y = aimPoint.moveY + aim.position.y; 
        }

        if(preventDownArrow) {
            aim.rotation = tmp.rotation;
            aimPoint.degree = tmp.degree;
            aimPoint.moveX = tmp.moveX;
            aimPoint.moveY = tmp.moveY;
        }


        if(lastKeyValue === left) { // 항상 음수가 되어야함(x값만)
            aim.position.x = anim.x - 200;

            if(aimPoint.moveX < 0) aimPoint.position.x = aim.position.x + aimPoint.moveX;
            else if(aimPoint.moveX > 0) aimPoint.position.x = aim.position.x - aimPoint.moveX;
            else  aimPoint.position.x = aim.position.x - 20;
                        
            aimPoint.position.y = aimPoint.moveY + aim.position.y;
        }         
        else if(lastKeyValue === right) {  // 항상 양수가 되어야함 (x값만)
            aim.position.x = anim.x + 200;

            if(aimPoint.moveX < 0) aimPoint.position.x = aim.position.x - aimPoint.moveX;      
            else if(aimPoint.moveX > 0) aimPoint.position.x = aim.position.x + aimPoint.moveX;
            else aimPoint.position.x = aim.position.x + 20;
                        
            aimPoint.position.y = aimPoint.moveY + aim.position.y;
        } 
    }
    static addArrow(idx) {
        const bodies = PhysicsRender.getAllBodies();
        if(!this.arrows) this.arrows = [];
        this.arrows.push(bodies[idx]);
    }
    static fadeArrow() {
        if(!this.arrows) return;

        for(let i=0; i<this.arrows.length; i++) {
            const physics = this.arrows[i].get('physics'),
                  body = this.arrows[i].get('body');
            
            body.alpha -= 0.002;

            if(body.alpha <= 0) {
                PhysicsRender.remove(physics,body);
                this.arrows.splice(i,1);    
            }
        }
    }
}

const gameHelper = ( () => {
    let basicMonsters = {
            sprite : [],
            physics : [],
            y : [],
            collisions : []
        },
        flights = {
            sprite : [],
            physics : [],
            y : [],
            collisions : [],
            radius : [],
            degree : []
        },
        lastUnit = {
            sprite : [],
            physics : [],
            y : [],
            collisions : [],
            radius : [],
            degree : [],
            count : [],
            originalVertices : []
        },
        event = {},
        level = 0;


    return class {
        static getGameLevel() {
            return level;
        }
        static setGameLevel(lv) {
            level = lv;
        }
        static moving() {
            switch(level) {
                case 0 : {
                    gameHelper.moveBasicMonster();
                }
                break;
                case 1 : {
                    gameHelper.moveFlight();
                }
                break;
                case 2 : {
                    gameHelper.moveLastUnit();
                }
                break;
            }
            
        }
        
        static getBasicMonsters() {
            return basicMonsters;
        }
        static getFlight() {
            return flights;
        }
        static getLastUnit() {
            return lastUnit;
        }

        static createBasicMonster() {
            if( (Math.random()*100 | 0) < 2) {
                let x = entireWidth + 100,
                    y = Math.random()*800 | 0,
                    body = Bodies.circle(x,y,25,{
                        link : './images/basicMonster.png',
                        label : 'basicMonster',
                        physics : basicMonsters.physics,
                        sprite : basicMonsters.sprite
                    });
            
                basicMonsters.y.push(y);  
                basicMonsters.collisions.push('stand')  
                new PhysicsRender(body).add();
            }
        }
        static createLastUnit() {
            if( (Math.random()*100 | 0) < 2) {
                const x = entireWidth + 100,
                      y = Math.random()*800 | 0,
                      w = 25,
                      h = 25,
                      body = Bodies.rectangle(x,y,w,h,{
                          label : 'lastUnit',
                          sprite : lastUnit.sprite,
                          link : './images/kr.jpg',
                          originalVertices : lastUnit.originalVertices
                      });

                lastUnit.physics.push(body);
                lastUnit.y.push(y);
                lastUnit.collisions.push('stand');
                lastUnit.degree.push(0);
                lastUnit.count.push(0);
                lastUnit.radius.push(Math.random()*300 | 0);
                
                new PhysicsRender(body,w,h).add();   
            }   
        }
        static moveLastUnit() {
            let willRemoveIndices = [];
            
            for(let i=0; i<lastUnit.physics.length; i++) {    
                let m = lastUnit.physics[i],
                    y = lastUnit.y[i],
                    s = lastUnit.sprite[i],
                    r = lastUnit.radius[i],
                    d = lastUnit.degree[i],
                    c = lastUnit.collisions[i];
                           
                for(let j=0; j<s.vertices.length; j+=2) {
                    lastUnit.count[i] += 0.01;

                    s.vertices[j] = Math.cos(j*0.35 + lastUnit.count[i] )*3 + lastUnit.originalVertices[i][j]; 
                    s.vertices[j+1] = Math.sin(j*0.35 + lastUnit.count[i] )*1 + lastUnit.originalVertices[i][j+1];        
                }     

                if(c === 'stand') {
                    if(leftOptical) {
                        Body.setPosition(m,{
                            x : m.position.x - 1,
                            y :  y - r*(Math.sin(Math.PI/180*d))
                        });
                    } else if(rightOptical) {
                        Body.setPosition(m,{
                            x : m.position.x - 7.5,
                            y :  y - r*(Math.sin(Math.PI/180*d))
                        });
                    } else {
                        Body.setPosition(m,{
                            x : m.position.x - 5,
                            y :  y - r*(Math.sin(Math.PI/180*d))
                        });
                    } 
                } else if(c === 'collision') {
                    Body.setVelocity(m,{
                        x : 5,
                        y : -5
                    });
                    lastUnit.collisions[i] = false;
                } else {  // remove
                    s.alpha -= 0.01;
                    if(s.alpha <= 0) {
                        PhysicsRender.remove(m,s);
                        //willRemoveIndices.push(i);
                    }
                }

                if(m.position.x < 0) { // remove
                    PhysicsRender.remove(m,s);       
                }

                lastUnit.degree[i]+=1;
            }

            // remove (performance improvement)
            for(let i=0; i<willRemoveIndices.length; i++) {
                //lastUnit.physics.splice(willRemoveIndices[i],1);
                //lastUnit.originalVertices.splice(willRemoveIndices[i],1);
                //lastUnit.sprite.splice(willRemoveIndices[i],1);
            }
        }

        static moveBasicMonster() {
            for(let i=0; i<basicMonsters.physics.length; i++) {    
                let m = basicMonsters.physics[i],
                    y = basicMonsters.y[i],
                    s = basicMonsters.sprite[i],
                    c = basicMonsters.collisions[i];

                if(c === 'stand') {
                    if(leftOptical) {
                        Body.setPosition(m,{
                            x : m.position.x - 1,
                            y : y
                        });
                    } else if(rightOptical) {
                        Body.setPosition(m,{
                            x : m.position.x - 7.5,
                            y : y
                        });
                    } else {
                        Body.setPosition(m,{
                            x : m.position.x - 5,
                            y : y
                        });
                    } 
                } else if(c === 'collision') {
                    Body.setVelocity(m,{
                        x : 5,
                        y : -5
                    });
                    basicMonsters.collisions[i] = false;
                } else {  // remove
                    s.alpha -= 0.01;
                    if(s.alpha <= 0) 
                        PhysicsRender.remove(m,s);
                }

                if(m.position.x < 0)  // remove
                    PhysicsRender.remove(m,s);              
            }
        }
        static basicMonsterAllClear() {
            for(let i=0; i<basicMonsters.physics.length; i++) {
                let m = basicMonsters.physics[i],
                    s = basicMonsters.sprite[i];

                PhysicsRender.remove(m,s);
            }
        }
        static flightAllClear() {
            for(let i=0; i<flights.physics.length; i++) {
                let m = flights.physics[i],
                    s = flights.sprite[i];

                PhysicsRender.remove(m,s);
            }
        }
        static lastUnitClear() {
            for(let i=0; i<lastUnit.physics.length; i++) {
                let m = lastUnit.physics[i],
                    s = lastUnit.sprite[i];

                PhysicsRender.remove(m,s);
            }
        }

        static createFlight() {
            if( (Math.random()*100 | 0) < 1.5) {
                let x = entireWidth + 100,
                    y = Math.random()*800 | 0,
                    flight = new Flight(x,y),
                    flightSprite = new PhysicsRender(flight);
                
                flightSprite.add();

                flights.physics.push(flight.body);
                flights.sprite.push(flightSprite.body);
                flights.y.push(y);
                flights.collisions.push('stand');
                flights.degree.push(0);
                flights.radius.push(Math.random()*300 | 0);
            }
        }
        static moveFlight() {
            for(let i=0; i<flights.physics.length; i++) {
                let m = flights.physics[i],
                    y = flights.y[i],
                    s = flights.sprite[i],
                    c = flights.collisions[i],
                    r = flights.radius[i],
                    d = flights.degree[i];
                
                if(c === 'stand') {
                    if(leftOptical) {
                        Body.setPosition(m,{
                            x : m.position.x - 1,
                            y : y - r*(Math.sin(Math.PI/180*d))
                        });
                    } else if(rightOptical) {
                        Body.setPosition(m,{
                            x : m.position.x - 7.5,
                            y : y - r*(Math.sin(Math.PI/180*d))
                        });
                    } else {
                        Body.setPosition(m,{
                            x : m.position.x - 5,
                            y : y - r*(Math.sin(Math.PI/180*d))
                        });
                    } 
                } else if(c === 'collision') {
                    Body.setVelocity(m,{
                        x : 5,
                        y : -5
                    });
                    flights.collisions[i] = false;
                } else {  // remove
                    s.alpha -= 0.01;
                    if(s.alpha <= 0) 
                        PhysicsRender.remove(m,s);
                }

                if(m.position.x < 0)  // remove
                    PhysicsRender.remove(m,s);  
                
                flights.degree[i]+=1;
            }
        }
        static collision() {
            Events.on(engine,'collisionStart', e => {
                let monster;

                switch(gameHelper.getGameLevel()) {
                    case 0 : monster = gameHelper.getBasicMonsters();
                    break; 
                    case 1 : monster = gameHelper.getFlight();
                    break;
                    case 2 : monster = gameHelper.getLastUnit();
                    break;
                }
                
                for(let i=0; i<e.pairs.length; i++) {
                    if(monster.physics.length) {
                        const body = monster.physics;
                        for(let j=0; j<body.length; j++) {
                            if (e.pairs[i].bodyA.label === 'flight' && e.pairs[i].bodyB.label === 'arrow' && monster.collisions[j] === 'stand') { // flight collider
                                if( (body[j].id - e.pairs[i].bodyA.id) <= 3 && (body[j].id - e.pairs[i].bodyA.id) > 0 ) {
                                    monster.collisions[j] = 'collision';
                                    break;
                                }
                            } else if(e.pairs[i].bodyA === body[j] /*&& e.pairs[i].bodyB.label === 'arrow'*/ && monster.collisions[j] === 'stand') {  // basicMonster,lastUnit  collider                               
                                monster.collisions[j] = 'collision';
                            } 
                        }
                    }

                    if(e.pairs[i].bodyA === ground.p && e.pairs[i].bodyB.label === 'arrow') { // arrow랑 ground랑 부딪혓을때
                        const allBodies = PhysicsRender.getAllBodies();

                        for(let k=0; k<allBodies.length; k++) {
                            const p1 = allBodies[k].get('physics').id-1,
                                  p2 = allBodies[k].get('physics').id-2;
                            let result;

                            if(p1 === e.pairs[i].bodyB.id) 
                                result = allBodies[k];
                        }
                    }
                } 
            });
        }
        static collsionOff() {
            Events.off(engine,'collisionStart');
        }
        static gameOver() {
            const text = new PIXI.Text('The game is over, thanks to playing', {
                fontSize: 50,
                fontFamily: 'Patrick Hand',
                fill: '	#ec8313',
                align: 'center',
                stroke: '#998066',
                strokeThickness: 2
            });
            const btn = document.querySelector('#btn');
        
            text.anchor.set(0.5,0.5);
            text.x = entireWidth/2;
            text.y = entireHeight/2;
            app.stage.addChild(text);
        
            btn.style.display = 'inline';
            btn.style.left = entireWidth/2 - 75;
            btn.style.top = text.height + text.y;
        
            btn.onclick = () => {
                window.location.reload();
            }
        }
    }
})();


window.setTimeout( () => {
    const fastenComment = new PIXI.Text('repo : https://github.com/hyunsooda',{
        fontFamily : 'Architects Daughter',
        fontSize : 35,
        fill : '#806699',
        align : 'center'
    });
    
    fastenComment.anchor.set(0.5,0.5);
    fastenComment.x = fastenComment.width/2 + 20;
    fastenComment.y = 20;
    app.stage.addChild(fastenComment);
},11000);











// key event setting
window.addEventListener('keydown',(e) => {
    switch(e.keyCode) {
        case left : {      
            if(!keyInputPrevent) {
                keyValue = left; 
                anim.skeleton.flipX =  true;
            }

            backupKeyValue = left; 
            lastKeyValue = left;
            freeze = ( (keyValue !== lastKeyValue) && keyInputPrevent) ? true : false;
        }
        break;
        case right : {      
            if(!keyInputPrevent) {
                keyValue = right; 
                anim.skeleton.flipX =  false;
            }

            backupKeyValue = right; 
            lastKeyValue = right;
            freeze = ( (keyValue !== lastKeyValue) && keyInputPrevent) ? true : false;
        }
        break;
        case up : {
            
            upFlag = true;          
            return;
        }
        break;
        case down : {
            downFlag = true;        
            return;
        }
        break;
        case 32 : {
            if(keyInputPrevent) return;

            if(anim.skeleton.flipX === true) {
                new PhysicsRender(new Arrow('left',aim.x,anim.y-200)).add();
            } else {
                new PhysicsRender(new Arrow('right',aim.x,anim.y-200)).add();
            }
            Archor.addArrow(PhysicsRender.getNums()-1);
            
            keyValue = undefined;
            anim.state.clearTrack(0);
            anim.state.setAnimation(0,'attack');
            keyInputPrevent = true;

            window.setTimeout( () => {
                anim.state.clearTrack(0);

                anim.skeleton.flipX = (lastKeyValue === left) ? true : false;

                keyValue = backupKeyValue;
                if(keyValue) anim.state.setAnimation(0,'run',true);
                else if(freeze) {
                    keyValue = lastKeyValue;
                    anim.state.setAnimation(0,'run',true);
                } else 
                    anim.state.setAnimation(0,'idle',true);

                keyInputPrevent = false;
            },420); // 타임스케일 0.5초 기준.
        } 
        default : return;

    }

    if(anim.state.getCurrent(0).animation.name === 'idle') {
        anim.state.clearTrack(0);
        anim.state.setAnimation(0,'run',true);
    }

},false);

window.addEventListener('keyup',(e) => {
    
    if(e.keyCode === lastKeyValue) freeze = false;

    switch(e.keyCode) {
        case left : if(keyValue === left) keyValue = undefined; backupKeyValue = undefined;
        break;
        case right : if(keyValue === right) keyValue = undefined; backupKeyValue = undefined;
        break;
        case up : upFlag = false;
        break;
        case down : downFlag = false;
        break;
    }

    if(freeze) return;
    
    if(anim.state.getCurrent(0).animation.name === 'run' && (!keyValue) ) {
        anim.state.clearTrack(0);
        anim.state.setAnimation(0,'idle',true);
    }

},false);

function move() {
    switch(keyValue) {
        case 37 : {
            anim.x -= leftOptical ? 0 : 5;
        }
        break;
        case 39 : {
            anim.x += rightOptical ? 0 : 5;
        }
        break;
    }

    window.requestAnimationFrame(move);
}

window.setTimeout( () => {
    move();
},10000)






let ground = new PhysicsRender(Bodies.rectangle(entireWidth/2,entireHeight-75,entireWidth,50,{
    isStatic : true,
    label : 'ground'
}),entireWidth,50);
ground.add();


let background = new PIXI.Sprite.fromImage('./images/sky.png');
background.width = backgroundWidth;
background.height = entireHeight - 75;
background.displayGroup = new PIXI.DisplayGroup(-99,false);
app.stage.addChild(background);


let background2 = new PIXI.Sprite.fromImage('./images/sky2.png');
background2.width = backgroundWidth;
background2.height = entireHeight - 75;
background2.displayGroup = new PIXI.DisplayGroup(-99,false);
background2.setTransform(backgroundWidth, 0, background2.scale.x, background2.scale.y);
app.stage.addChild(background2);



export {
    PhysicsRender,
    utilControl,
    gameHelper,
    anim
}


    

                  
                  
                  















//let a = app.renderer.plugins.extract.image(app.stage);

/*
const box = All.M.Bodies.rectangle(500,200,50,50);
World.add(world,Bodies.rectangle(500,800,1000,200,{isStatic:true}));
World.add(world,box)



var shape = new PIXI.Graphics();
shape.beginFill(0xCC5533);
shape.lineStyle(1,0xFFFFFF);
shape.drawRect(0,0,50,50);
var sprite = new PIXI.Sprite(shape.generateCanvasTexture());
sprite.anchor.x = 0.5;
sprite.anchor.y = 0.5;
sprite.position.x = 500;
sprite.position.y = 200;
app.stage.addChild(sprite);

app.ticker.add( () => {
    sprite.position.x = box.position.x;
    sprite.position.y = box.position.y;
    sprite.rotation = box.angle;
})
*/

