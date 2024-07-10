import { exec } from 'child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const command = `
  protoc --plugin=node_modules/.bin/protoc-gen-ts_proto \\
    -I=./proto/ \\
    -I=./node_modules/google-proto-files/ \\
    ./proto/users.proto \\
    --ts_proto_out=src/generated/ \\
    --ts_proto_opt=nestJs=true
`;

const GENERATED_DIR = path.resolve(__dirname, 'src/generated');

const fixFieldMask = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace incorrect string[] type with FieldMask type
  const updateMask = 'updateMask: string[] | undefined;';
  if (content.includes(updateMask)) {
    content = content.replaceAll(
      updateMask,
      'updateMask: FieldMask | undefined;',
    );

    if (
      !content.includes(
        "import { FieldMask } from './google/protobuf/field_mask';",
      )
    ) {
      content =
        `import { FieldMask } from './google/protobuf/field_mask';\n` + content;
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }
};

const traverseDirectory = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      traverseDirectory(filePath);
    } else if (file.endsWith('.ts')) {
      fixFieldMask(filePath);
    }
  });
};

exec(command, (error, stdout, stderr) => {
  // Это что-то очень странное, но типы ts-proto генерирует не правильно
  // https://github.com/stephenh/ts-proto/issues/847#issuecomment-2219967538
  traverseDirectory(GENERATED_DIR);

  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
