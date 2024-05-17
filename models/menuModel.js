const mongoose = require('mongoose')


const menuSchema = mongoose.Schema({

    name: String,

},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Menu', menuSchema)