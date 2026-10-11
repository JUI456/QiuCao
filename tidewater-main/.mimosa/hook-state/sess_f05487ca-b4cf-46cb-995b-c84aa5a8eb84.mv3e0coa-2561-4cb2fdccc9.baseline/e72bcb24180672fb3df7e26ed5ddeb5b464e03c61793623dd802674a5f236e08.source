import { Texture } from '../../engine/gpu/Texture.js';
import { ShaderModule } from '../../engine/gpu/Shader.js';
import { generateMipmaps } from '../../engine/gpu/Mipmaps.js';
import { commonModule } from '../../engine/render/wgsl/common.js';

// 「秋草生日快乐」写在出生点南面那片干沙滩上。
//
// 字不在地形高度场里：TerrainData 的遮罩 1 m 一格，汉字笔画只有零点几米宽，会被采样成锯齿。
// 而是在片元着色器里按世界坐标采一张运行时用 Canvas 画好的贴图，笔画边缘干净，还能跟着沙子的
// 湿度、小径和风纹一起被冲淡，看起来像耙出来的而不是贴上去的。
//
// 位置：中央沙滩上，出生点 (53.6, -77) 正南偏西，从木栈道下来朝海走几步就能看见；不压 PATHS
// 的任何一条小径，也不落在水线以下（着色器里还有高度遮罩兜底）。
export const BEACH_MESSAGE = {
	text: '秋草生日快乐',
	x: 2, z: - 58, // 中心点（米）
	width: 26, height: 6.5, // 贴图覆盖的世界尺寸（米）
	yaw: 0, // 0 = 站在北边面朝大海（+z）读出来是正的
};

const TEX_W = 2048, TEX_H = 512;

// 笔画边缘先柔化，再用沙粒把 alpha 轻微打散：远处 mipmap 会把它抹回柔和的一团，近处看得出
// 是沙里耙出来的字，而不是激光切割的硬边。
function drawMessage() {

	const c = document.createElement( 'canvas' );
	c.width = TEX_W;
	c.height = TEX_H;
	const ctx = c.getContext( '2d', { willReadFrequently: true } );
	ctx.clearRect( 0, 0, TEX_W, TEX_H );
	ctx.filter = 'blur(1.6px)';
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '500 300px "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", sans-serif';
	ctx.fillText( BEACH_MESSAGE.text, TEX_W / 2, TEX_H / 2 + 6 );
	ctx.filter = 'none';

	const img = ctx.getImageData( 0, 0, TEX_W, TEX_H );
	const d = img.data;
	for ( let i = 3; i < d.length; i += 4 ) {

		if ( d[ i ] ) d[ i ] = Math.min( 255, d[ i ] * ( 0.84 + Math.random() * 0.3 ) );

	}

	ctx.putImageData( img, 0, 0 );
	return img.data;

}

// A ShaderModule for the terrain material only. The terrain shader samples this inside a
// non-uniform branch (the seabed path), so both functions take the screen-space derivative of the
// world position as an argument and use textureSampleLevel — no derivative builtins of their own,
// which would be invalid control flow there.
//
// finalizeMaterial() runs twice (the constructor, then again once the shore system hands over its
// wetness module): build the canvas and the texture once and share the module, or each pass bakes a
// second 4 MB texture that nothing ever frees.
let _module = null;

export function beachMessageModule() {

	if ( _module ) return _module;

	const { x: CX, z: CZ, width: W, height: H, yaw } = BEACH_MESSAGE;
	const cs = Math.cos( yaw ).toFixed( 6 ), sn = Math.sin( yaw ).toFixed( 6 );

	const data = drawMessage();
	const texture = new Texture( {
		label: 'beachMessage', width: TEX_W, height: TEX_H, format: 'rgba8unorm',
		mips: true, usage: [ 'sample', 'copyDst' ], sampler: 'linearClamp', data,
	} );
	texture.getGPU();
	generateMipmaps( texture );

	// R = 字的书写方向（画面右），U = 字顶方向（离站位更远的一侧）
	const basis = /* wgsl */`
	let R = vec2f( - ${ cs }, - ${ sn } );
	let U = vec2f( R.y, - R.x );
`;

	_module = new ShaderModule( {
		name: 'beachMessage',
		deps: [ commonModule ],
		bindings: { beachMessageTex: { texture } },
		code: /* wgsl */`
fn beachMessageLod( dpx: vec2f, dpy: vec2f ) -> f32 {
	${ basis }
	let dudx = dot( dpx, R ) / ${ W }; let dvdx = - dot( dpx, U ) / ${ H };
	let dudy = dot( dpy, R ) / ${ W }; let dvdy = - dot( dpy, U ) / ${ H };
	let tx = max( abs( dudx ), abs( dudy ) ) * ${ TEX_W }.0;
	let ty = max( abs( dvdx ), abs( dvdy ) ) * ${ TEX_H }.0;
	return clamp( log2( max( max( tx, ty ), 1.0 ) ), 0.0, 9.0 );
}

fn beachMessageAt( xz: vec2f, lod: f32 ) -> f32 {
	${ basis }
	let e = xz - vec2f( ${ CX }, ${ CZ } );
	let u = dot( e, R ) / ${ W } + 0.5;
	let v = 0.5 - dot( e, U ) / ${ H };
	if ( u < 0.0 || u > 1.0 || v < 0.0 || v > 1.0 ) { return 0.0; }
	// .a carries the glyph coverage (the canvas is transparent, the strokes white)
	return textureSampleLevel( beachMessageTex, smpLinearClamp, vec2f( u, v ), lod ).a;
}
`,
	} );

	return _module;

}