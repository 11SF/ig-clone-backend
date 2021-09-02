const Post = require('../models/Post')
let router = require('express').Router()
const auth = require('../middleware/auth')
const multer  = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/images');
    },
    filename: (req, file, cb) => {
    //   console.log(file);
      let filetype = '';
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});
const upload = multer({storage: storage});

router.get('/fetchPost', auth, async (req,res) => {
    const posts = await Post.find();
    res.status(200).json(posts)
})

router.post('/createPost', auth, upload.single('file'), async (req,res) => {
    const { caption } = req.body;
    const owner_id = req.user.id
    const username = req.user.username
    
    if(!req.file) {
        return res.status(400).json({msg: 'image is required'});
    }

    const post = await Post.create({
        owner_id,
        username,
        caption,
        imagePath: req.file.path,
        timestamp: Date.now()
    })

    res.status(200).json({msg: 'Created Post Success'})
})

router.put('/createComment', auth, async (req,res) => {
    try {
        const username = req.user.username
        const owner_id = req.user.id
        const {text, id} = req.body
        const comment = {
            owner_id,
            username,
            text,
            timestamp: Date.now()
        }
        const post = await Post.findById(id)
        if(post) {
            const newComments = [...post.comments, comment]
            const result = await Post.findByIdAndUpdate(id, {comments: newComments})
            return res.status(200).json({msg: "Add comment successfully"})
        }
        res.status(500).json({msg: "error"})
    }
    catch(err) {
        res.status(500).json({msg: err.message})
    }
})
module.exports = router
