PIXI.CustomBaseCloth = ( () => {
    return class {
        constructor(col,row,width,texture,drawMode) {
            this.orgVertices = [];
            const option = this.init(col,row,width);
            this.mesh = new PIXI.mesh.Mesh(texture,option.vertices,option.uvs,option.indices,drawMode);
        }
        init(col,row,width) {
            if(col !== row)
                throw new Error('Col and row should equl each other')

            let vertices = [],
                uvs = [],
                indices = [],
                ROW = row,
                COL = col;

            for(let i=0; i<col+1; i++) {
                for(let j=0; j<row+1; j++) {
                    vertices.push(j*width,i*width);   
                    this.orgVertices.push(j*width,i*width);  
                    uvs.push( j*(1/ROW) , i*(1/COL));
                }
            }

            for(let i=0; i<col; i++) {
                for(let j=0; j<row; j++) {
                    indices.push( (row+1)*i+j, (row+1)*i+j+1, (col+1)*(i+1)+j, (col+1)*(i+1)+j+1 );
                }
            }

            return {
                vertices : new Float32Array(vertices),
                uvs : new Float32Array(uvs),
                indices : new Uint16Array(indices)
            };
        }
        findNearVerticesIdx(dest) {
            let min = 10000,
                distance,
                x,
                y,
                idx;
        
            for(let i=0; i<mesh.vertices.length; i+=2) {
                x = (mesh.x + mesh.vertices[i]) - mouse.x;
                y = (mesh.y + mesh.vertices[i+1]) - mouse.y;
                distance = Math.sqrt(x**2 + y**2);
                if(distance < min) {
                    min = distance;
                    idx = i;
                }
            }

            return idx;
        }
    }
})();