const multer=require('multer')
const path = require('path')


let storage=multer.diskStorage({

destination:function(req,file,cb){
   cb(null,'/admin/assets/product')}
 ,
 filename:function(req,file,cb){
      const name=file.originalname+'-'+Date.now()
      cb(null,name)
 }

})

const upload=multer({storage:storage})

module.exports=upload