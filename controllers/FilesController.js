import Queue from 'bull/lib/queue';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { mkdir, writeFile } from 'fs/promises';
import dbClient from '../utils/db';
import { getIdAndKey, isAuthorized } from '../utils/users';

class FilesController {
  static async postUpload(req, res) {
    const fileQ = new Queue('fileQ');
    const directory = process.env.FOLDER;
    const { userid } = await getIdAndKey(req);
    if (!userid) return res.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.usersCollection.findOne({ _id: ObjectId(userid) });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const fileType = req.body.type;
    if (!fileType) return res.status(400).send({ error: 'Missing type' });

    const filename = req.body.name;
    if (!filename) return res.status(400).send({ error: 'Missing name' });

    const filedata = req.body.data;
    if (!filedata) return res.status(400).send({ error: 'Missing data' });

    const isPublic = req.body.isPublic || false;
    let pId = req.body.parentId || 0;
    pId = pId === '0' ? 0 : pId;
    if (pId !== 0) {
      const parent = await dbClient.filesCollection.findOne({ _id: ObjectId(pId) });
      if (!parent) return res.status(400).send({ error: 'Parent not found' });
      if (parent.type !== 'dir') return res.status(400).send({ error: 'Parent is not a directory' });
    }

    const data = {
      userId: userid,
      name: filename,
      type: fileType,
      isPublic,
      parentId: pId,
    };

    if (fileType === 'folder') {
      await dbClient.filesCollection.insertOne({ ...data, type: 'dir' });
      return res.status(201).send(
        {
          userId: userid,
          name: filename,
          type: fileType,
          isPublic,
          parentId: pId,
        },
      );
    }

    const fileUID = uuidv4();
    const filePath = `${directory}/${fileUID}`;
    const dataBuffer = Buffer.from(filedata, 'base64');

    mkdir(directory, { recursive: true }).then(() => {
      writeFile(filePath, dataBuffer).then(() => {
        dbClient.files.insertOne({ ...data, _id: fileUID });
        fileQ.add({ userId: userid, fileId: fileUID });
        return res.status(201).send(
          {
            userId: userid,
            name: filename,
            type: fileType,
            isPublic,
            parentId: pId,
          },
        );
      });
    }).catch(() => res.status(500).send({ error: 'Upload failed' }));
    return true;
  }
}

// Export the FilesController class
module.exports = FilesController;
