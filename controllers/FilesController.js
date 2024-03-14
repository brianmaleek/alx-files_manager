import Queue from 'bull/lib/queue';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { mkdir, writeFile } from 'fs/promises';
import dbClient from '../utils/db';
import getIdAndKey from '../utils/users';

class FilesController {
  static async postUpload(req, res) {
    try {
      const fileQ = new Queue('fileQ');
      const directory = process.env.FOLDER;

      const { userid } = await getIdAndKey(req);
      if (!userid) return res.status(401).send({ error: 'Unauthorized' });

      const user = await dbClient.usersCollection.findOne({ _id: ObjectId(userid) });
      if (!user) return res.status(401).send({ error: 'Unauthorized' });

      const fileType = req.body.type;
      const filename = req.body.name;
      const filedata = req.body.data;

      if (!fileType || !filename || !filedata) {
        return res.status(400).send({ error: 'Missing required fields' });
      }

      let parentId = req.body.parentId || 0;
      parentId = parentId === '0' ? 0 : parentId;

      if (parentId !== 0) {
        const parent = await dbClient.filesCollection.findOne({ _id: ObjectId(parentId) });
        if (!parent) return res.status(400).send({ error: 'Parent not found' });
        if (parent.type !== 'dir') return res.status(400).send({ error: 'Parent is not a directory' });
      }

      const data = {
        userId: userid,
        name: filename,
        type: fileType,
        isPublic: req.body.isPublic || false,
        parentId,
      };

      if (fileType === 'folder') {
        await dbClient.filesCollection.insertOne({ ...data, type: 'dir' });
        return res.status(201).send(data);
      }

      const fileUID = uuidv4();
      const filePath = `${directory}/${fileUID}`;
      const dataBuffer = Buffer.from(filedata, 'base64');

      await mkdir(directory, { recursive: true });
      await writeFile(filePath, dataBuffer);

      await dbClient.files.insertOne({ ...data, _id: fileUID });
      await fileQ.add({ userId: userid, fileId: fileUID });

      return res.status(201).send(data);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: 'Upload failed' });
    }
  }

  static async getShow(req, res) {
    try {
      const { userid } = await getIdAndKey(req);
      if (!userid) return res.status(401).send({ error: 'Unauthorized' });

      const user = await dbClient.usersCollection.findOne({ _id: ObjectId(userid) });
      if (!user) return res.status(401).send({ error: 'Unauthorized' });

      const fileId = req.params.id;
      const file = await dbClient.files.findOne({ _id: ObjectId(fileId) });
      if (!file) return res.status(404).send({ error: 'Not found' });

      if (file.userId.toString() !== userid) return res.status(404).send({ error: 'Not found' });

      return res.status(200).send({ ...file });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: 'Server error' });
    }
  }
}

// Export the FilesController class
module.exports = FilesController;
