
const bannerCollection = require('../../Model/bannerModel')

const bannerView = async (req, res) => {

    try {
        let bannerData= await bannerCollection.find({})
        res.render('../views/admin/banner/bannerView.ejs',{bannerData})

    } catch (error) {

        console.log(error)
        res.status(500)
    }

}

const addBannerView = async (req, res) => {

    try {
        console.log(req.msg);
        res.render('../views/admin/banner/addBanner.ejs')

    } catch (error) {

        console.log(error)
        res.status(500)
    }
}

const addBanner = async (req, res) => {

    try {
       

           const banner = new bannerCollection({

                text: req.body.heading,
                image: req.file.filename
            })
        
        await banner.save()

        res.redirect('/admin/banner')
    } catch (error) {

        console.log(error);
        res.status(500)
    }
}

module.exports = {

    bannerView,
    addBannerView,
    addBanner
}