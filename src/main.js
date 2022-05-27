import * as Logger from './log.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Hexo from 'hexo';
import { DateTime } from 'luxon';

const _CONFIG_LOCALE = 'en';

async function init() {
  Logger.init();

  const startTime = DateTime.now();

  Logger.log(
    chalk.cyan(
      'Importing process start: ' +
        startTime.setLocale(_CONFIG_LOCALE).toLocaleString(DateTime.TIME_24_WITH_SECONDS) +
        '.'
    )
  );

  const args = process.argv;

  if (args.length < 3) {
    Logger.error('Arguments not provided. Use ' + chalk.red('ig2hexo <backup path>') + '.');
    process.exit(0);
  }

  const backupPath = args[2];

  try {
    await fs.promises.access(path.resolve(path.dirname(''), backupPath));
    await fs.promises.access(path.resolve(path.dirname(''), backupPath + 'content/posts_1.json'));
    // check succeeded
  } catch (error) {
    // check failed
    Logger.error('Instagram backup path not found in that place.\n' + error);
    process.exit(0);
  }

  const posts = JSON.parse(
    await fs.promises.readFile(path.resolve(path.dirname(''), backupPath + 'content/posts_1.json'))
  );

  Logger.log(chalk.cyan('IG posts parsed successfully.'));

  // console.log(json);

  let hexo = new Hexo(process.cwd(), {});
  await hexo.init();

  Logger.log(chalk.cyan('Hexo instance initialized.'));

  let numPosts = 0;

  for (const post of posts) {
    // let text = post.title ? post.title : post.media[0].title;

    // TODO: we have big problems here with the unicode encoding

    // text = text.replace('\n', '\u000D');
    // console.log(text);
    // text = JSON.parse('"' + text + '"');
    // text = text.normalize();

    const timestamp = post.creation_timestamp
      ? post.creation_timestamp * 1000
      : post.media[0].creation_timestamp * 1000;

    const images = post.media.map((media) => {
      return media.uri;
    });

    // console.log(images);

    await hexo.post.create(
      {
        title:
          'Instagram post from ' +
          DateTime.fromMillis(timestamp)
            .setLocale(_CONFIG_LOCALE)
            .toLocaleString(DateTime.DATETIME_MED),
        layout: 'ig',
        date: timestamp,
        images,
        content: 'blabla', //text,
      },
      true
    );

    numPosts++;
  }

  const endTime = DateTime.now();
  const time = endTime.diff(startTime, 'seconds').toObject();

  Logger.log(
    chalk.cyan(
      'Importing process ended: ' +
        time.seconds.toFixed(1) +
        ' seconds.\n' +
        ' - ' +
        numPosts +
        ' posts.'
    )
  );
}

async function run() {}

export default {
  init,
  run,
};
