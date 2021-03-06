import * as Logger from './log.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Hexo from 'hexo';
import { DateTime } from 'luxon';
import iconv from 'iconv-lite';

const _CONFIG_LOCALE = 'en';
const _CONFIG_POST_LAYOUT = 'ig';

// fix, facebook code monkeys were wrong with this
// (apparently both in facebook and instagram exports)
// https://krvtz.net/posts/how-facebook-got-unicode-wrong.html
function fixEncoding(string) {
  return iconv.decode(iconv.encode(string, 'latin1'), 'utf8');
}

async function init() {
  Logger.init();

  const startTime = DateTime.now();

  Logger.log(
    chalk.cyan(
      'Import starts: ' +
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
    await fs.promises.readFile(
      path.resolve(path.dirname(''), backupPath + 'content/posts_1.json'),
      'utf8'
    )
  );

  Logger.log(chalk.cyan('IG posts parsed successfully.'));

  let hexo = new Hexo(process.cwd(), {});
  await hexo.init();

  Logger.log(chalk.cyan('Hexo instance initialized.'));

  let numPosts = 0;

  for (const post of posts) {
    let text = post.title ? post.title : post.media[0].title;
    text = fixEncoding(text);

    const timestamp = post.creation_timestamp
      ? post.creation_timestamp * 1000
      : post.media[0].creation_timestamp * 1000;

    const images = post.media.map((media) => {
      return media.uri;
    });

    await hexo.post.create(
      {
        title:
          'Instagram post from ' +
          DateTime.fromMillis(timestamp)
            .setLocale(_CONFIG_LOCALE)
            .toLocaleString(DateTime.DATETIME_MED),
        layout: _CONFIG_POST_LAYOUT,
        date: timestamp,
        images,
        content: text,
      },
      true
    );

    numPosts++;
  }

  const endTime = DateTime.now();
  const time = endTime.diff(startTime, 'seconds').toObject().seconds;

  Logger.log(
    chalk.cyan('Import ended: ' + time.toFixed(1) + ' seconds.\n' + ' - ' + numPosts + ' posts.')
  );
}

async function run() {}

export default {
  init,
  run,
};
