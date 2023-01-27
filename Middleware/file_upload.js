const multer =require('multer')

let storage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'public/admin/assets/banner')
    },
    filename:function(req,file,cb){
        const name=file.filename+'-'+file.originalname;
    cb(null,name)
    }
})

const upload= multer({
    storage:storage,
    fileFilter: function (req, file, cb,next) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
       //   return cb(new Error("Only image files are allowed!"));
         // req.msg='Only image files are allowed!'
        
        }
        cb(null, true);
      },
})


module.exports=upload