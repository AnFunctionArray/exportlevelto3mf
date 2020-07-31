window.onresize = () => {
    let canvas = document.body.querySelector("canvas")
    canvas.height = window.innerHeight, canvas.width = window.innerWidth

    ///let test = canvas.getContext("webgl")

    //test.clearColor(0.0, 0.0, 0.0, 0.5), test.clear(test.COLOR_BUFFER_BIT)

    Windows.UI.ViewManagement.ApplicationView.getForCurrentView().tryResizeView({ width: 1, height: 1 })
}

let single = false

const app = WinJS.Application
const activation = Windows.ApplicationModel.Activation
let isFirstActivation = true

app.onactivated = function (args) {
    if (args.detail.kind === activation.ActivationKind.voiceCommand) {
        // TODO: Handle relevant ActivationKinds. For example, if your app can be started by voice commands,
        // this is a good place to decide whether to populate an input field or choose a different initial view.
    }
    else if (args.detail.kind === activation.ActivationKind.launch) {
        // A Launch activation happens when the user launches your app via the tile
        // or invokes a toast notification by clicking or tapping on the body.
        if (args.detail.arguments) {
            // TODO: If the app supports toasts, use this value from the toast payload to determine where in the app
            // to take the user in response to them invoking a toast notification.
        }
        else if (args.detail.previousExecutionState === activation.ApplicationExecutionState.terminated) {
            // TODO: This application had been suspended and was then terminated to reclaim memory.
            // To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
            // Note: You may want to record the time when the app was last suspended and only restore state if they've returned after a short period.
        }
    }

    if (!args.detail.prelaunchActivated) {
        // TODO: If prelaunchActivated were true, it would mean the app was prelaunched in the background as an optimization.
        // In that case it would be suspended shortly thereafter.
        // Any long-running operations (like expensive network or disk I/O) or changes to user state which occur at launch
        // should be done here (to avoid doing them in the prelaunch case).
        // Alternatively, this work can be done in a resume or visibilitychanged handler.
    }

    if (isFirstActivation) {
        launch()
        args.setPromise(WinJS.UI.processAll())
    }

    isFirstActivation = false
}

const launch = async () => {

    class classtextinfo {
        /**
         *
         * @param {Windows.Storage.Streams.DataReader} datareader
         */
        constructor(datareader) {
            datareader.readUInt32()
            datareader.readUInt32()

            this.primarytexture = datareader.readUInt32()

            datareader.readUInt32()

            this.secondarytexture = datareader.readUInt32()

            //for (const a of new Array(3).keys())
            //    datareader.readUInt32()

            datareader.readUInt32()
        }
    }

    /** @type {(classtextinfo[] & {currenttextureoffset: number})[]} */
    const zonetextureinfo = []

    let picker = new Windows.Storage.Pickers.FolderPicker()
    picker.fileTypeFilter.append("*")

    const folder = await picker.pickSingleFolderAsync()
    let files = await folder.getFilesAsync(), file = files.filter(value => value.fileType == ".RMX").pop(),

        zonefiles = files.filter(value => value.fileType.startsWith(".Z"))

    console.log(file.name)

    console.log(zonefiles)

    const outfile = await folder.createFileAsync(file.name + ".3mf", Windows.Storage.CreationCollisionOption.replaceExisting)

    /*{
        //const buffer = new Windows.Storage.Streams.Buffer(0)

        const stream = new Windows.Storage.Streams.InMemoryRandomAccessStream()

        const writer = new Windows.Storage.Streams.DataWriter(stream)

        writer.unicodeEncoding = Windows.Storage.Streams.UnicodeEncoding.utf8
        writer.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian

        writer.writeString("hello world")

        console.log(await writer.storeAsync())

        writer.detachStream()

        const buffer = new Windows.Storage.Streams.Buffer(stream.size)

       // writer.writeBuffer()

        //const reader = new Windows.Storage.Streams.DataReader(stream.getInputStreamAt(0))

        //reader.unicodeEncoding = Windows.Storage.Streams.UnicodeEncoding.utf8
        //reader.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian

        //await reader.loadAsync(stream.size)

        console.log(await Windows.Storage.FileIO.writeBufferAsync(outfile, await stream.getInputStreamAt(0).readAsync(buffer, stream.size, Windows.Storage.Streams.InputStreamOptions.none)))

        debugger
    }*/


    //Windows.Storage.FileIO.writeTextAsync(outfile, "ply\nformat ascii 1.0\n")

    const threed3mf = new Windows.Graphics.Printing3D.Printing3D3MFPackage()

    const model3mf = new Windows.Graphics.Printing3D.Printing3DModel()

    class openedfileaddedmethods {
        createreaderat(at) {
            const reader = new Windows.Storage.Streams.DataReader(this.getInputStreamAt(at))
            reader.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian
            return reader
        }
    }

    /** @type {(filearg: typeof file, access: Windows.Storage.FileAccessMode) => (Windows.Storage.Streams.IRandomAccessStream & openedfileaddedmethods)} */
    const openfile = async (file, access) => new Proxy(await file.openAsync(access), {
        get: (obj, prop) => {
            try {
                return prop in obj ? obj[prop] : openedfileaddedmethods.prototype[prop].bind(obj)
            }
            catch (err) { return undefined }
        }
    })

    const openedfile = await openfile(file, Windows.Storage.FileAccessMode.read)

    let datareader = openedfile.createreaderat(0)

    //datareader.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian

    await datareader.loadAsync(0x14)

    console.log(datareader.readSingle())

    for (const a of [0, 0, 0]) datareader.readUInt32()

    const amountofrooms = datareader.readUInt32()

    datareader.close()

    datareader = openedfile.createreaderat(0x14)

    await datareader.loadAsync(amountofrooms * 4)

    const offsetstorooms = []

    for (const a of new Array(amountofrooms).fill(0))
        offsetstorooms.push(datareader.readUInt32())

    console.log(offsetstorooms)

    /**
     * @param {number} roomhash
     * @param {typeof file} zonefile
     * @param {number[]} point
     * @param {classtextinfo[] & {currenttextureoffset: number}} textinfo
     * @param {boolean} cachetextures
     */
    const drawroomifexist = async (point, roomhash, zonefile, textinfo, cachetextures) => {
        const openedfile = await openfile(zonefile, Windows.Storage.FileAccessMode.read)

        let datareader = openedfile.createreaderat(0)

        /** @type {classtextinfo[]} */
        //const textinfo = []

        class texthead {
            /**
             *
             * @param {Windows.Storage.Streams.DataReader} datareader
             */
            constructor(datareader) {
                this.format = datareader.readUInt32()
                for (const a of new Array(3).keys())
                    datareader.readUInt32()

                this.levelsmip = datareader.readUInt32()

                this.xsize = datareader.readUInt32()

                this.ysize = datareader.readUInt32()

                this.datasize = datareader.readUInt32()

                datareader.readUInt32()

                datareader.readUInt32()
            }
        }

        /** @type {texthead[]} */
        const textheaders = []

        /** @type {Windows.Storage.Streams.IBuffer[]} */
        //const textdata = []

        //const temporaryfile = Windows.Storage.ApplicationData.current.localCacheFolder.createFileAsync("test.dds", Windows.Storage.CreationCollisionOption.replaceExisting)

        const parsetexturedata = async texturesoffset => {
            textinfo.currenttextureoffset = threed3mf.textures.size
            const datareader = openedfile.createreaderat(texturesoffset)
            await datareader.loadAsync(0x10)
            const amounttextinfo = datareader.readUInt32()
            datareader.readUInt32()
            const amounttextdata = datareader.readUInt32()
            datareader.readUInt32()
            await datareader.loadAsync(amounttextinfo * 0x18)

            for (const a of new Array(amounttextinfo).keys())
                textinfo.push(new classtextinfo(datareader))

            await datareader.loadAsync(amounttextdata * 0x28)

            for (const a of new Array(amounttextdata).keys())
                textheaders.push(new texthead(datareader))

            for (const [i, a] of textheaders.entries()) {
                const temporaryfile = await Windows.Storage.ApplicationData.current.localCacheFolder.createFileAsync(zonefile.name + i + "temporary.png", Windows.Storage.CreationCollisionOption.replaceExisting)
                const temporaryrandomaccessstream = await temporaryfile.openAsync(Windows.Storage.FileAccessMode.readWrite)
                const temporarywritertorandomaccessstream = new Windows.Storage.Streams.DataWriter(temporaryrandomaccessstream)
                temporarywritertorandomaccessstream.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian
                /*const ddsheader = {
                    magicnumber: 542327876 /*"DDS "*//*, structuresize: 0x7c, dwFlags: 0, dwHeight: a.ysize, dwWidth: a.xsize, dwPitchOrLinearSize: 0,
                dwDepth: 0, dwMipMapCount: a.levelsmip
            }

            for (const a of new Array(11 + 2).keys())
                ddsheader["Unused" + a] = 0

            Object.assign(ddsheader, { ddspf: a.format, dwCaps: 0, dwCaps2: 0, dwCaps3: 0, dwCaps4: 0, dwReserved2: 0 })

            for (const a of new Array(7 - 2).keys())
                ddsheader["Unused2_" + a] = 0

            let offset = 0

            for (const a in ddsheader)
                temporarywritertorandomaccessstream.writeUInt32(ddsheader[a]), offset += 4*/

                const rgbaout = [], compressionin = []

                await datareader.loadAsync(a.datasize),
                    //temporarywritertorandomaccessstream.writeBuffer(datareader.readBuffer(a.datasize))

                    compressionin.length = a.datasize

                datareader.readBytes(compressionin)

                /*DecompressImage(rgbaout, a.xsize, a.ysize, compressionin)

                const canvas = document.body.querySelector("canvas")*/

                const canvas = document.body.querySelector("canvas")


                /*
1) Take the square root of the number X; we'll call it N.
2) Set N equal to the ceiling of N (round up to the nearest integer).
3) Test for (X % N). If N divides evenly into X, we found our first number.
if 0, divide X by N to get M. M and N are our numbers
if not 0, increment N by 1 and start step 3 over.
 */

                /*const X = new Uint8Array(compressionin).buffer.byteLength

                let width, height

                let N = Math.floor(Math.sqrt(X))

                while (true) {

                    if (!(X % N)) { width = X / N, height = N; if (!(width % 4) && !(height % 4)) break; else --N }
                    else --N
                }

                //const width = a.xsize, height = a.ysize

                if(width === height === undefined) debugger*/

                canvas.height = a.ysize, canvas.width = a.xsize

                const ctx = canvas.getContext("2d")

                const width = a.xsize, height = a.ysize

                const inmemorycanvas = document.createElement('canvas')

                inmemorycanvas.height = a.ysize, inmemorycanvas.width = a.xsize

                //if (a.format !== 827611204 && a.format !== 861165636) debugger

                inmemorycanvas.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(a.format !== 0x15 ? dxtJs.decompress(compressionin, a.xsize, a.ysize, a.format === 827611204 ? dxtJs.flags.DXT1 : dxtJs.flags.DXT3) : compressionin), a.xsize, a.ysize), 0, 0)

                //   context.rotate(Math.PI / 2)

                function flipImage(flipH, flipV) {
                    var scaleH = flipH ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
                        scaleV = flipV ? -1 : 1, // Set verical scale to -1 if flip vertical
                        posX = flipH ? width * -1 : 0, // Set x position to -100% if flip horizontal 
                        posY = flipV ? height * -1 : 0; // Set y position to -100% if flip vertical

                    ctx.save(); // Save the current state
                    ctx.scale(scaleH, scaleV); // Set scale to flip the imag
                    ctx.drawImage(inmemorycanvas, posX, posY, width, height)
                    ctx.restore(); // Restore the last saved state
                }

                flipImage(false, true)



                /*let ext = <WEBGL_compressed_texture_s3tc>gl.getExtension('WEBGL_compressed_texture_s3tc');*/

                /* const gl = canvas.getContext("webgl")
 
                 let ext = gl.getExtension('WEBGL_compressed_texture_s3tc')
 
                 //var dxt = require('dxt-js')
 
                 var ctx3d = gl;*/

                /*var img, tex, vloc, tloc, vertexBuff, texBuff;

                
                var ctx3d = gl;
                var uLoc;

                // create shaders
                var vertexShaderSrc =
                    "attribute vec2 aVertex;" +
                    "attribute vec2 aUV;" +
                    "varying vec2 vTex;" +
                    "uniform vec2 pos;" +
                    "void main(void) {" +
                    "  gl_Position = vec4(aVertex + pos, 0.0, 1.0);" +
                    "  vTex = aUV;" +
                    "}";

                var fragmentShaderSrc =
                    "precision highp float;" +
                    "varying vec2 vTex;" +
                    "uniform sampler2D sampler0;" +
                    "void main(void){" +
                    "  gl_FragColor = texture2D(sampler0, vTex);" +
                    "}";

                var vertShaderObj = ctx3d.createShader(ctx3d.VERTEX_SHADER);
                var fragShaderObj = ctx3d.createShader(ctx3d.FRAGMENT_SHADER);
                ctx3d.shaderSource(vertShaderObj, vertexShaderSrc);
                ctx3d.shaderSource(fragShaderObj, fragmentShaderSrc);
                ctx3d.compileShader(vertShaderObj);
                ctx3d.compileShader(fragShaderObj);

                var progObj = ctx3d.createProgram();
                ctx3d.attachShader(progObj, vertShaderObj);
                ctx3d.attachShader(progObj, fragShaderObj);

                ctx3d.linkProgram(progObj);
                ctx3d.useProgram(progObj);

                //ctx3d.viewport(0, 0, 1024, 768);

                vertexBuff = ctx3d.createBuffer();
                ctx3d.bindBuffer(ctx3d.ARRAY_BUFFER, vertexBuff);
                ctx3d.bufferData(ctx3d.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]), ctx3d.STATIC_DRAW);

                texBuff = ctx3d.createBuffer();
                ctx3d.bindBuffer(ctx3d.ARRAY_BUFFER, texBuff);
                ctx3d.bufferData(ctx3d.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]), ctx3d.STATIC_DRAW);

                vloc = ctx3d.getAttribLocation(progObj, "aVertex");
                tloc = ctx3d.getAttribLocation(progObj, "aUV");
                uLoc = ctx3d.getUniformLocation(progObj, "pos");

                    //ctx3d.bindTexture(ctx3d.TEXTURE_2D, tex);
                    //ctx3d.texParameteri(ctx3d.TEXTURE_2D, ctx3d.TEXTURE_MIN_FILTER, ctx3d.NEAREST);
                    //ctx3d.texParameteri(ctx3d.TEXTURE_2D, ctx3d.TEXTURE_MAG_FILTER, ctx3d.NEAREST);
                    //ctx3d.texImage2D(ctx3d.TEXTURE_2D, 0, ctx3d.RGBA, ctx3d.RGBA, ctx3d.UNSIGNED_BYTE, this);

                    ctx3d.enableVertexAttribArray(vloc);
                    ctx3d.bindBuffer(ctx3d.ARRAY_BUFFER, vertexBuff);
                    ctx3d.vertexAttribPointer(vloc, 2, ctx3d.FLOAT, false, 0, 0);

                    ctx3d.enableVertexAttribArray(tloc);
                    ctx3d.bindBuffer(ctx3d.ARRAY_BUFFER, texBuff);
                    //ctx3d.bindTexture(ctx3d.TEXTURE_2D, tex);
                    ctx3d.vertexAttribPointer(tloc, 2, ctx3d.FLOAT, false, 0, 0);

                    ctx3d.drawArrays(ctx3d.TRIANGLE_FAN, 0, 4);

                const glerror = gl.getError()*/

                /*const fragmentshader = `precision mediump float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
   gl_FragColor = texture2D(u_image, v_texCoord);
}`
                const vertexshader = `attribute vec2 a_position;

uniform mat3 u_matrix;

varying vec2 v_texCoord;

void main() {
   gl_Position = vec4(u_matrix * vec3(a_position, 1), 1);

   // because we're using a unit quad we can just use
   // the same data for our texcoords.
   v_texCoord = a_position;  
}`

                var vertShaderObj = ctx3d.createShader(ctx3d.VERTEX_SHADER);
                var fragShaderObj = ctx3d.createShader(ctx3d.FRAGMENT_SHADER);
                ctx3d.shaderSource(vertShaderObj, vertexshader);
                ctx3d.shaderSource(fragShaderObj, fragmentshader);
                ctx3d.compileShader(vertShaderObj);
                ctx3d.compileShader(fragShaderObj);

                var program = ctx3d.createProgram();
                ctx3d.attachShader(program, vertShaderObj);
                ctx3d.attachShader(program, fragShaderObj);

                ctx3d.linkProgram(program);
                ctx3d.useProgram(program);

                var positionLocation = gl.getAttribLocation(program, "a_position");

                // look up uniform locations
                //var u_imageLoc = gl.getUniformLocation(program, "u_image");
                var u_matrixLoc = gl.getUniformLocation(program, "u_matrix");

                // provide texture coordinates for the rectangle.
                var positionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                    0.0, 0.0,
                    1.0, 0.0,
                    0.0, 1.0,
                    0.0, 1.0,
                    1.0, 0.0,
                    1.0, 1.0]), gl.STATIC_DRAW);
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                // create framebuffer attachment texture
                let colorTarget = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, colorTarget);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    width,
                    height,
                    0,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    null
                );
                // setup framebuffer
                let fb = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTarget, 0);

                // create and upload compressed texture
                let compressedTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, compressedTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.compressedTexImage2D(gl.TEXTURE_2D, 0, ext.COMPRESSED_RGBA_S3TC_DXT1_EXT, width, height, 0, new Uint8Array(compressionin).buffer);

                gl.viewport(0, 0, width, height);

                var dstX = 20;
                var dstY = 30;
                var dstWidth = 64;
                var dstHeight = 64;

                // convert dst pixel coords to clipspace coords      
                var clipX = dstX / gl.canvas.width * 2 - 1;
                var clipY = dstY / gl.canvas.height * -2 + 1;
                var clipWidth = dstWidth / gl.canvas.width * 2;
                var clipHeight = dstHeight / gl.canvas.height * -2;

                // build a matrix that will stretch our
                // unit quad to our desired size and location
                gl.uniformMatrix3fv(u_matrixLoc, false, [
                    clipWidth, 0, 0,
                    0, clipHeight, 0,
                    clipX, clipY, 1,
                ]);

                // Draw the rectangle.
                gl.drawArrays(gl.TRIANGLES, 0, 6);

                //an array means word

                /*const drawstruct = struct => {
                    for (const a in struct)
                        if (!Array.isArray(struct[a])) temporarywritertorandomaccessstream.writeUInt32(struct[a])
                        else temporarywritertorandomaccessstream.writeUInt16(struct[a][0])
                }

                const bmpheader = { signature: [19778], filesz: rgbaout.length + 54, reserved: 0, dataoffset: 54 }

                const infobmpheader = { size: 40, width: a.xsize / 2, height: a.ysize , planes: [1], bitsperpixel: [32], compression: 0, imagesize: 0, xpixelsperm: 0, ypixelsperm: 0, colorsused: 256, importantcolors: 0}

                drawstruct(bmpheader)

                drawstruct(infobmpheader)*/

                const pngdatauri = canvas.toDataURL()

                const xhr = new XMLHttpRequest();
                xhr.open("GET", pngdatauri);
                xhr.responseType = "arraybuffer";

                await new Promise(resolve =>
                    xhr.onload = function () {
                        // result = ArrayBuffer, from here assign a view to it
                        //if (xhr.status === 200) console.log(new Uint8Array(xhr.response))

                        temporarywritertorandomaccessstream.writeBytes(new Uint8Array(xhr.response))

                        resolve()
                    },
                    xhr.send())

                //temporarywritertorandomaccessstream.writeBytes()

                await temporarywritertorandomaccessstream.storeAsync()

                temporarywritertorandomaccessstream.detachStream()

                temporarywritertorandomaccessstream.close()

                temporaryrandomaccessstream.close()

                const texturedata = new Windows.Graphics.Printing3D.Printing3DTextureResource()

                texturedata.name = "/3D/Texture/texture" + i + textinfo.currenttextureoffset

                texturedata.textureData = await temporaryfile.openReadAsync()

                threed3mf.textures.append(texturedata)

                //model3mf.material.texture2CoordGroups.

                /*const temporaryreader = new Windows.Storage.Streams.DataReader(temporaryrandomaccessstream.getInputStreamAt(0))

                temporaryreader.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian

                temporaryreader.loadAsync(temporaryrandomaccessstream.size)

                await Windows.Storage.FileIO.writeBufferAsync(outfile, temporaryreader.readBuffer(temporaryrandomaccessstream.size))

                temporaryreader.detachStream()

                temporaryreader.close()*/
            }
        }

        await datareader.loadAsync(0x10)

        datareader.readUInt32() //format id
        if (cachetextures) return parsetexturedata(datareader.readUInt32())
        else datareader.readUInt32() //textures offset
        datareader.readUInt32() //object headers offset

        const meshesoffset = datareader.readUInt32()
        datareader.close()

        datareader = openedfile.createreaderat(meshesoffset)

        await datareader.loadAsync(4)

        const amountofrooms = datareader.readUInt32()

        let currentoffset = meshesoffset + 4

        for (const a of new Array(amountofrooms).keys()) {
            datareader.close()

            datareader = openedfile.createreaderat(currentoffset)

            await datareader.loadAsync(8)

            const zoneroomhash = datareader.readUInt32(), roomsize = datareader.readUInt32()
            currentoffset += roomsize + 4
            if (zoneroomhash !== roomhash) continue

            await datareader.loadAsync(roomsize)

            datareader.readUInt32()
            datareader.readUInt32()

            const amountvertices = datareader.readUInt32()

            datareader.readUInt32()

            const amountindices = datareader.readUInt32()

            datareader.readUInt32()

            const amountgroups = datareader.readUInt32()

            for (const a of new Array(5).keys()) datareader.readUInt32()

            class vertex {
                constructor() {
                    this.x = datareader.readSingle()
                    this.z = datareader.readSingle()
                    this.y = datareader.readSingle()

                    this.u = datareader.readSingle()
                    this.v = datareader.readSingle()

                    this.u1 = datareader.readSingle()
                    this.v1 = datareader.readSingle()

                    datareader.readUInt32()
                    datareader.readUInt32()
                    datareader.readUInt32()
                }
            }

            /** @type {vertex[]} */a
            let vertices = []

            for (const a of new Array(amountvertices).keys()) vertices.push(new vertex())

            /** @type {number[]} */
            let indices = []

            for (const a of new Array(amountindices).keys()) indices.push(datareader.readUInt16())

            //console.log(await verticeswriter.detachStream().writeAsync(verticesbuffer))

            //await Windows.Storage.FileIO.writeBufferAsync(outfile, verticesbuffer)

            class group {
                constructor() {
                    this.amountoffaces = datareader.readUInt32()
                    this.amountofvertices = datareader.readUInt32()
                    this.startindex = datareader.readUInt32()
                    this.materialindex = datareader.readUInt32()

                    datareader.readUInt32()

                    this.basevertexindex = datareader.readUInt32()
                    this.lastvertex = datareader.readUInt32()
                    this.primitivetype = datareader.readUInt32()

                    /** @type {number[]} */
                    this.pos1 = []
                    4
                    for (const a of new Array(4).keys())

                        this.pos1.push(datareader.readSingle())

                    /** @type {number[]} */
                    this.pos2 = []

                    for (const a of new Array(4).keys())

                        this.pos2.push(datareader.readSingle())
                }
            }

            const verticesstream = new Windows.Storage.Streams.InMemoryRandomAccessStream()

            const verticeswriter = new Windows.Storage.Streams.DataWriter(verticesstream)

            verticeswriter.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian

            /** @type {Map<number, { group: Windows.Graphics.Printing3D.Printing3DTexture2CoordMaterialGroup, vertex2cords: Map<number, number>}>} */
            let material2cordinatesgroups = new Map()

            /*const tex2CoordGroup = new Windows.Graphics.Printing3D.Printing3DTexture2CoordMaterialGroup(1);

            model3mf.material.texture2CoordGroups
            for (const a of threed3mf.textures.keys())
                model3mf.material.texture2CoordGroups = new Windows.Graphics.Printing3D.Printing3DTexture2CoordMaterialGroup(a + 1)*/

            for (const vertex of vertices)
                //model3mf.material.texture2CoordGroups
                verticeswriter.writeDouble(vertex.x), verticeswriter.writeDouble(vertex.y), verticeswriter.writeDouble(vertex.z)

            console.log(await verticeswriter.storeAsync())

            verticeswriter.detachStream()

            verticeswriter.close()

            const mesh = new Windows.Graphics.Printing3D.Printing3DMesh()

            mesh.vertexPositionsDescription = { format: Windows.Graphics.Printing3D.Printing3DBufferFormat.printing3DDouble, stride: 3 }

            mesh.triangleIndicesDescription = { format: Windows.Graphics.Printing3D.Printing3DBufferFormat.printing3DUInt, stride: 3 }

            mesh.triangleMaterialIndicesDescription = { format: Windows.Graphics.Printing3D.Printing3DBufferFormat.printing3DUInt, stride: 4 }

            //const roomamounrofvertices = currentgroup.lastvertex - currentgroup.

            mesh.createVertexPositions(8 * amountvertices * 3)

            const verticesbuffer = mesh.getVertexPositions()

            mesh.vertexCount = amountvertices

            const indicesstream = new Windows.Storage.Streams.InMemoryRandomAccessStream()

            const indicesmaterialstream = new Windows.Storage.Streams.InMemoryRandomAccessStream()

            //verticesstream.size = verticesbuffer.capacity

            const indiceswriter = new Windows.Storage.Streams.DataWriter(indicesstream)

            const indicesmaterialwriter = new Windows.Storage.Streams.DataWriter(indicesmaterialstream)

            indicesmaterialwriter.byteOrder = indiceswriter.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian

            if (await verticesstream.getInputStreamAt(0).readAsync(verticesbuffer, verticesstream.size, Windows.Storage.Streams.InputStreamOptions.none) !== verticesbuffer) throw 0

            verticesstream.close()

            /** @type {group[]}*/
            const groups = []

            for (const a of new Array(amountgroups).keys())
                groups.push(new group())

            indices = indices.concat(indices, indices)

            vertices = vertices.concat(vertices, vertices)

            groups.sort((a, b) => a.startindex > b.startindex ? 1 : -1)

            mesh.indexCount = 0

            ///** @type {Map<number,number>[]} */
            /* let mapvertex2texture2cord = []
 
             for (const a of threed3mf.textures.keys()) {
                 mapvertex2texture2cord[a] = new Map()
                 /*for (const y of vertices.keys())
                     mapvertex2texture2cord[a][y] = []*/
            //}

            /*model3mf.material.texture2CoordGroups.append(Object.assign(new Windows.Graphics.Printing3D.Printing3DTexture2CoordMaterialGroup(1),
                { texture: Object.assign(new Windows.Graphics.Printing3D.Printing3DModelTexture(), { textureResource: threed3mf.textures[0] }) }))

            model3mf.material.texture2CoordGroups[0].texture2Coords.append(Object.assign(new Windows.Graphics.Printing3D.Printing3DTexture2CoordMaterial(),
                { u: 1, v: 1 }))*/

            /*model3mf.material.texture2CoordGroups.append(new Windows.Graphics.Printing3D.Printing3DTexture2CoordMaterialGroup(1))

            //model3mf.material.texture2CoordGroups[0].texture = new Windows.Graphics.Printing3D.Printing3DModelTexture()

            //model3mf.material.texture2CoordGroups[0].texture = new Windows.Graphics.Printing3D.Printing3DModelTexture()

           // model3mf.material.texture2CoordGroups[0].texture.textureResource = threed3mf.textures[0]

            model3mf.material.texture2CoordGroups[0].texture2Coords.append(new Windows.Graphics.Printing3D.Printing3DTexture2CoordMaterial())

            model3mf.material.texture2CoordGroups[0].texture2Coords[0].u = 0, model3mf.material.texture2CoordGroups[0].texture2Coords[0].v = 1,

               // model3mf.material.texture2CoordGroups[0].texture2Coords[0].texture = model3mf.material.texture2CoordGroups[0].texture

                model3mf.material.texture2CoordGroups[0].texture2Coords.append(new Windows.Graphics.Printing3D.Printing3DTexture2CoordMaterial())

            model3mf.material.texture2CoordGroups[0].texture2Coords[model3mf.material.texture2CoordGroups[0].texture2Coords.size - 1].u = 1,
                model3mf.material.texture2CoordGroups[0].texture2Coords[model3mf.material.texture2CoordGroups[0].texture2Coords.size - 1].v = 1,

                //model3mf.material.texture2CoordGroups[0].texture2Coords[model3mf.material.texture2CoordGroups[0].texture2Coords.size - 1].texture
                //= model3mf.material.texture2CoordGroups[0].texture

                model3mf.material.texture2CoordGroups[0].texture2Coords.append(new Windows.Graphics.Printing3D.Printing3DTexture2CoordMaterial())

            model3mf.materia    l.texture2CoordGroups[0].texture2Coords[model3mf.material.texture2CoordGroups[0].texture2Coords.size - 1].u = 1,
                model3mf.material.texture2CoordGroups[0].texture2Coords[model3mf.material.texture2CoordGroups[0].texture2Coords.size - 1].v = 0

            //model3mf.material.texture2CoordGroups[0].texture2Coords[model3mf.material.texture2CoordGroups[0].texture2Coords.size - 1].texture
                //= model3mf.material.texture2CoordGroups[0].texture*/

            //for (const a of threed3mf.textures.keys())
            //model3mf.metadata.insert("tex" + (a + 1), threed3mf.textures[a].name)

            const diffrenentextures = new Set()

            for (const a of groups.keys()) {

                console.log("group " + a + " begin")
                const currentgroup = Object.assign({}, groups[a])

                const lastindex = groups[a + 1] ? groups[a + 1].startindex : amountindices

                //model3mf.metadata.insert("tex1", threed3mf.textures[0].name)

                let textureindex = textinfo[currentgroup.materialindex].primarytexture

                //diffrenentextures.add(textureindex)

                //if (textureindex !== 4294967295 && diffrenentextures.size > 1) debugger

                if (material2cordinatesgroups.get(currentgroup.materialindex) === undefined)
                    textureindex !== 4294967295 ?
                        (model3mf.material.texture2CoordGroups.append(new Windows.Graphics.Printing3D.Printing3DTexture2CoordMaterialGroup(currentgroup.materialindex + 1)),
                            material2cordinatesgroups.set(currentgroup.materialindex, { group: model3mf.material.texture2CoordGroups[model3mf.material.texture2CoordGroups.size - 1], vertex2cords: new Map() }),
                            model3mf.metadata.insert("tex" + (currentgroup.materialindex + 1), threed3mf.textures[textureindex + textinfo.currenttextureoffset].name))
                        : material2cordinatesgroups.set(currentgroup.materialindex, null)
                //text2cordinatesgroups[textureindex].texture = Object.assign(new Windows.Graphics.Printing3D.Printing3DModelTexture(), { textureResource: threed3mf.textures[textureindex] })*/

                //textureindex = 4294967295

                const coordinatesgroup = textureindex !== 4294967295 ? material2cordinatesgroups.get(currentgroup.materialindex) : null

                //model3mf.metadata.insert("tex1", threed3mf.textures[0].name)

                //const last2 = []

                const distinctvalues = []

                //let amountdistinctvertices

                function checkindex(index) {

                    if (!distinctvalues.includes(index))
                        distinctvalues.push(index)

                    return distinctvalues.length
                    /*if (last2.includes(index)) return -1

                    if (index >= amountvertices) debugger

                    if (last2.length > 2) last2.length = 0

                    last2.push(index)

                    return index*/
                }

                switch (currentgroup.primitivetype) {

                    case 5:

                        let currentindicesslice

                        let currentgroupmeshcount = 0

                        //currentgroup.startindex = 0


                        for (; currentgroupmeshcount < currentgroup.amountoffaces; currentgroup.startindex++) {
                            let currentindex = currentgroup.startindex

                            while (new Set(currentindicesslice = indices.slice(currentindex, currentindex + 3)).size !== currentindicesslice.length)
                                ++currentindex
                            if (currentindicesslice.length < 3) break //debugger
                            let elemtexture2cord
                            for (const a of new Array(4).keys()) {
                                const currentvertexindex = indices[currentindex]
                                const currentvertex = vertices[currentvertexindex / 0x100]
                                textureindex !== 4294967295 ? a === 0 ? indicesmaterialwriter.writeUInt32(currentgroup.materialindex + 1) :
                                    indicesmaterialwriter.writeUInt32(elemtexture2cord) : indicesmaterialwriter.writeUInt32(0)

                                a < 3 ? (textureindex !== 4294967295 ? (coordinatesgroup.vertex2cords.get(currentvertexindex) ? elemtexture2cord =
                                    coordinatesgroup.vertex2cords.get(currentvertexindex)
                                    : (coordinatesgroup.group.texture2Coords.append(Object.assign(new Windows.Graphics.Printing3D.Printing3DTexture2CoordMaterial(),
                                        { u: vertices[currentvertexindex].u, v: vertices[currentvertexindex].v })), elemtexture2cord = coordinatesgroup.group.texture2Coords.size - 1,
                                        coordinatesgroup.vertex2cords.set(currentvertexindex, elemtexture2cord))) : 0, indiceswriter.writeUInt32(indices[currentindex++])) : 0
                            }

                            ++currentgroupmeshcount
                        }

                        mesh.indexCount += currentgroupmeshcount

                        //if (mesh.indexCount % 3) debugger

                        //mesh.indexCount /= 3
                        break

                    case 6: //untested code potentially may brake

                        debugger

                        mesh.indexCount = 0

                        const fanbase = indices[currentgroup.startindex++]

                        for (; currentgroup.startindex + 1 < lastindex;) {
                            indiceswriter.writeUInt32(indices[currentgroup.startindex])

                            indiceswriter.writeUInt32(indices[currentgroup.startindex + 1])

                            indiceswriter.writeUInt32(indices[fanbase])

                            ++currentgroup.startindex

                            ++mesh.indexCount
                        }
                        break

                    case 4:

                        debugger
                        mesh.indexCount = 0

                        for (; currentgroup.startindex + 2 < lastindex;) {

                            for (const a of new Array(3).keys())
                                indiceswriter.writeUInt32(indices[currentgroup.startindex++])

                            ++mesh.indexCount
                        }
                        break

                    default: debugger
                }

                // mesh.indexCount /= 3

                //break

                //if (!Number.isInteger(mesh.indexCount))
                //console.log(mesh.indexCount)

                console.log("group " + a + " end")
            }

            const indicessize = await indiceswriter.storeAsync()

            mesh.createTriangleIndices(indicessize)

            const indicesbuffer = mesh.getTriangleIndices()

            indiceswriter.detachStream()

            if (await indicesstream.getInputStreamAt(0).readAsync(indicesbuffer, indicessize, Windows.Storage.Streams.InputStreamOptions.none) !== indicesbuffer) throw 0

            //await Windows.Storage.FileIO.writeBufferAsync(outfile, indicesbuffer)

            indiceswriter.close()

            indicesstream.close()

            const indicesmaterialbindingssize = await indicesmaterialwriter.storeAsync()

            mesh.createTriangleMaterialIndices(indicesmaterialbindingssize)

            const indicesmaterialbindingsbuffer = mesh.getTriangleMaterialIndices()

            indicesmaterialwriter.detachStream()

            if (await indicesmaterialstream.getInputStreamAt(0).readAsync(indicesmaterialbindingsbuffer, indicesmaterialbindingssize, Windows.Storage.Streams.InputStreamOptions.none) !== indicesmaterialbindingsbuffer) debugger

            //await Windows.Storage.FileIO.writeBufferAsync(outfile, indicesmaterialbindingsbuffer)

            indicesmaterialwriter.close()

            indicesmaterialstream.close()

            model3mf.meshes.append(mesh)

            const component = new Windows.Graphics.Printing3D.Printing3DComponent()

            component.mesh = mesh

            model3mf.components.append(component)

            const componentwithmatrix = {}

            componentwithmatrix.component = component

            componentwithmatrix.matrix = Object.assign({}, new Windows.Graphics.Printing3D.Printing3DComponentWithMatrix().matrix);

            [point[1], point[2]] = [point[2], point[1]]

            for (const row of new Array(4).keys())
                for (const elem of new Array(4).keys()) {
                    //componentwithmatrix.matrix["m" + (row + 1) + (elem + 1)] && row !== 3 ? componentwithmatrix.matrix["m" + (row + 1) + (elem + 1)] = 100 : 0
                    elem === 3 && row < 3 ? componentwithmatrix.matrix["m" + (row + 1) + (elem + 1)] = point[row] : 0
                }

            /*componentwithmatrix.matrix.m14 = point[0]
            componentwithmatrix.matrix.m24 = point[1]
            componentwithmatrix.matrix.m34 = point[2]
            componentwithmatrix.matrix.m44 = 1*/

            /*indiceswriter.writeUInt32(1),
                indiceswriter.writeUInt32(0),
                indiceswriter.writeUInt32(2)

            mesh.indexCount = 1*/

            //await indiceswriter.flushAsync()

            model3mf.build.components.append(Object.assign(new Windows.Graphics.Printing3D.Printing3DComponentWithMatrix(), componentwithmatrix))

            //debugger
            return true
        }
        return false
    }

    const drawroom = async (point, roomhash) => {

        let foundroom = false
        for (const [i, zonefile] of zonefiles.entries())
            if (foundroom = await drawroomifexist(point, roomhash, zonefile, zonetextureinfo[i], false)) break
        //if (!foundroom) debugger
    }

    const parseroom = async offset => {
        datareader.close()

        datareader = openedfile.createreaderat(offset + 0x64)

        await datareader.loadAsync(0x18)

        const roomhash = datareader.readUInt32()

        for (const a of [0, 0]) datareader.readUInt32() //skip 2 dwords

        const point = []

        for (const a of [0, 0, 0]) point.push(datareader.readSingle())

        return await drawroom(point, roomhash)
    }

    for (const zonefile of zonefiles)
        await drawroomifexist([], 0, zonefile, zonetextureinfo[zonetextureinfo.length] = [], true)

    /*const texturedata = new Windows.Graphics.Printing3D.Printing3DTextureResource()

    texturedata.name = "/3D/Texture/texture" + 1

    texturedata.textureData = await (await Windows.Storage.ApplicationData.current.localCacheFolder.getFileAsync("mslogo.png")).openReadAsync()

    threed3mf.textures.append(texturedata)*/


    for (const offset of offsetstorooms)
        if (await parseroom(offset) === true) break

    await threed3mf.saveModelToPackageAsync(model3mf)

    const modelpartreader = new Windows.Storage.Streams.DataReader(threed3mf.modelPart)

    const newmodelpart = new Windows.Storage.Streams.InMemoryRandomAccessStream()

    const newmodelpartwriter = new Windows.Storage.Streams.DataWriter(newmodelpart)

    await modelpartreader.loadAsync(threed3mf.modelPart.size)

    //await Windows.Storage.FileIO.writeBufferAsync(outfile, modelpartreader.readBuffer(threed3mf.modelPart.size))

    const modelpart = modelpartreader.readString(threed3mf.modelPart.size)

    newmodelpartwriter.writeString(modelpart.replace(/contenttype=\"\"/g, "contenttype=\"image/png\""))

    await newmodelpartwriter.storeAsync()

    newmodelpartwriter.detachStream()

    newmodelpartwriter.close()

    threed3mf.modelPart = newmodelpart

    const stream = await threed3mf.saveAsync()

    stream.seek(0)

    datareader = new Windows.Storage.Streams.DataReader(stream)

    await datareader.loadAsync(stream.size)

    await Windows.Storage.FileIO.writeBufferAsync(outfile, datareader.readBuffer(stream.size))
}

app.start()
