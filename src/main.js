// const Parser = require('rss-parser');
// const request = require('request');
// const fs = require('fs');
// const mime = require('mime-types');
// const slugify = require('slugify');

import * as Logger from './log.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

async function init() {
  Logger.init();

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

  const json = JSON.parse(
    await fs.promises.readFile(path.resolve(path.dirname(''), backupPath + 'content/posts_1.json'))
  );

  Logger.log(chalk.cyan('IG posts parsed successfully.'));

  // console.log(json);
}

async function run() {}

export default {
  init,
  run,
};

// old code
/*
//Function that pulls the image file for the next Instagram post
//And calls to upload it to my server
const getAndGo = function (accessToken) {
  const item = itemsArray.shift();

  const imageUrl = item.enclosure.url;
  const instagramLink = item.link;
  const publishDate = item.pubDate; //Format Tue, 30 Oct 2018 15:59:02 +0900
  const description = item.contentSnippet;

  //Upload the image
  uploadImage(accessToken, imageUrl, publishDate, description, instagramLink);
};

//Function which handles uploading an image to the server
const uploadImage = function (accessToken, imageUrl, publishDate, description) {
  console.log('Upload image called');

  const filename = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
  const fullFilename = '/home/scripts/images/' + filename;

  //Check if that file already exists
  if (fs.existsSync(fullFilename)) {
    console.log('File (' + fullFilename + ') already exists');
    console.log('This post has likely already been posted');

    //Get the next image
    getAndGo(accessToken);

    return false;

    //File doesnt already exist
  } else {
    //Get the image and write it to the file system
    request(imageUrl)
      .pipe(fs.createWriteStream(fullFilename))
      .on('error', function (err) {
        console.log('Error saving image');
        console.log(err);
      })
      .on('close', function () {
        console.log('Done saving image');

        const type = mime.lookup(fullFilename);

        var uploadOptions = {
          url: 'https://thomasclowes.com/ghost/api/v0.1/uploads',
          headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'image/jpeg',
          },
          formData: {
            uploadimage: fs.createReadStream(fullFilename),
          },
        };

        //Upload the image through the Ghost API
        //This essentially makes a copy of the image
        const postResponse = request.post(uploadOptions, function (error, r, imageUrl) {
          if (error) {
            console.log('Error uploading image');
            console.log(error);
          }

          //URL returned from Ghost API is enclosed in ". Remove these.
          const processedImageUrl = imageUrl.replace(/"/g, '');
          console.log(processedImageUrl);
          console.log('Uploaded Image');

          //Create a Ghost post using the details we have
          submitPost(accessToken, processedImageUrl, publishDate, description);

          return true;
        });
      });
  }
};

//Function that creates a Ghost post through the Ghost public API
const submitPost = function (accessToken, imageUrl, publishDate, description) {
  const mobileDoc = {
    version: '0.3.1',
    atoms: [],
    cards: [
      ['image', { caption: description, src: imageUrl }],
      [
        'markdown',
        {
          markdown:
            '  This post was originally posted on [my Instagram](https://instagram.com/thomasclowes).',
        },
      ],
    ],
    markups: [],
    sections: [
      [10, 0],
      [10, 1],
      [1, 'p', []],
    ],
  };

  //We will make post titles the first sentence of description
  const postTitle = description.substr(
    0,
    description.indexOf('.') !== -1 ? description.indexOf('.') : description.length
  );
  const postSlug = slugify('Instagram ' + postTitle);
  const postTags = [];

  //We will tag all posts with 'Instagram'
  postTags.push({ name: 'instagram' });

  //Filter out any hash tags and set them as tags on the post
  const hashTags = description.split(' ').filter((v) => v.startsWith('#'));
  hashTags.forEach(function (hashTag) {
    postTags.push({ name: hashTag.replace('#', '') });
  });

  //Post data object in a	format accepted by the Ghost API
  const postData = {
    posts: [
      {
        author: '1',
        //featured:       false,
        feature_image: imageUrl,
        language: 'en_GB',
        mobiledoc: JSON.stringify(mobileDoc),
        meta_description: description,
        custom_excerpt: description,
        meta_title: postTitle,
        //page:           false,
        published_by: null,
        slug: postSlug,
        status: 'published',
        tags: postTags,
        title: postTitle,
        published_at: publishDate,
      },
    ],
  };

  var options = {
    url: 'https://thomasclowes.com/ghost/api/v0.1/posts',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
  };

  //Submit the post to the API
  const postResponse = request
    .post(options, function (e, r, body) {
      console.log(body);
      console.log('Posted');

      //If there are still posts to process
      //Lets process the next one
      if (itemsArray.length != 0) {
        console.log('Getting the next item. ' + itemsArray.length + ' left.');
        getAndGo(accessToken);
      }
      return true;
    })
    .form(postData);
};

getInstagramPosts();
*/
