const multer =require('multer')

let storage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'/admin/assets/category')
    },
    filename:function(req,file,cb){
        const name=file.filename+'-'+file.originalname;
    cb(null,name)
    }
})

const upload= multer({storage:storage})


module.exports=upload