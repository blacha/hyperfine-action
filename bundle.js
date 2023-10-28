import esbuild from 'esbuild';
import clear from 'esbuild-plugin-clear';

esbuild.build({
  entryPoints: ['./src/action.ts'],
  platform: 'node',
  bundle: true,
  outfile: './dist/index.cjs',
  plugins: [clear('./dist')],
});
