const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const adminSchema = new Schema({
    name: {
        type: String
    },
    surname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    cafe: {
        type: String
    },
    autoPlay: {
        type: Boolean
    },
    tempCafe: {
        type: String
    }
}, { timestamps: true });

adminSchema.statics.login = async function (email, password) {
    const admin = await this.findOne({ email });
    console.log(admin)
    if (admin) {
        const auth = await bcrypt.compare(password, admin.password);
        if (auth) {
            console.log('basarili', auth, admin);
            return admin;
        }
        console.log('paswordha')
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
}

const userSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    key: {
        type: String
    },
    password: {
        type: String
    },
    isVoted: {
        type: Boolean
    },
    isEncored: {
        type: Boolean
    },
    encoreTime: {
        type: Number
    },
    auth: {
        type: Number
    },
    amount: {
        type: Number
    },
    encoredTime: {
        type: Number
    },
    cafe: {
        type: String
    },
    votedSongs: [
        {
            name: {
                type: String
            },
        }
    ],
    encoredSong: {
        _id: {
            type: mongoose.Schema.Types.ObjectId
        },
        songName: {
            type: String
        },
        thumbnail: {
            type: String
        },
        singer: {
            type: String
        },
        songLink: {
            type: String
        },
        songDuration: {
            type: Number
        }
    }
}, { timestamps: true });

// Static metod to login user

userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        if (user.email === email && user.key === password) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
}

const settingsSchema = new Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    keywords: {
        type: String
    },
    instagram: {
        type: String
    },
    youtube: {
        type: String
    },
    twitter: {
        type: String
    },
    facebook: {
        type: String
    },
    phone: {
        type: String
    },
    adress: {
        type: String
    },
    email: {
        type: String
    },
    voting: {
        type: Boolean
    },
    votingTime: {
        type: Number
    },
    settingID: {
        type: Number
    },
    votedSong: {
        type: {
            _id: {
                type: mongoose.Schema.Types.ObjectId
            },
            songName: {
                type: String
            },
            thumbnail: {
                type: String
            },
            singer: {
                type: String
            },
            songLink: {
                type: String
            },
            vote: {
                type: Number
            },
            songDuration: {
                type: Number
            }
        }
    },
    placeName: {
        type: String
    },
    table: {
        type: Number
    },
    playlist: {
        type: String
    },
    encoredTime: {
        type: Number
    },
}, { timestamps: true });

const playlistSchema = new Schema({
    link: {
        type: String
    },
    cafe: {
        type: String
    },
    playlistName: {
        type: String
    },
    songs: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        },
        songName: {
            type: String
        },
        thumbnail: {
            type: String
        },
        singer: {
            type: String
        },
        songLink: {
            type: String
        },
        vote: {
            type: Number
        },
        cafe: {
            type: String
        },
        songDuration: {
            type: Number
        }
    }]
})

const encoreSchema = new Schema({
    thumbnail: {
        type: String
    },
    songName: {
        type: String
    },
    songLink: {
        type: String
    },
    songDuration: {
        type: Number
    },
    singer: {
        type: String
    },
    cafe: {
        type: String
    },
    name: {
        type: String
    },
    text: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
})

const messagesSchema = new Schema({
    name: {
        type: String,
    },
    surname: {
        type: String,
    },
    city: {
        type: String,
    },
    district: {
        type: String,
    },
    caffeName: {
        type: String,
    },
    tableAmount: {
        type: Number,
    },
    phone: {
        type: String,
    },
    subject: {
        type: String,
    },
    message: {
        type: String,
    }
})

const votingSongsSchema = new Schema({
    playlistID: {
        type: mongoose.Schema.Types.ObjectId
    },
    songName: {
        type: String
    },
    thumbnail: {
        type: String
    },
    singer: {
        type: String
    },
    songLink: {
        type: String
    },
    vote: {
        type: Number
    },
    cafe: {
        type: String
    },
    songDuration: {
        type: Number
    }
})

const placeSchema = new Schema({
    name: {
        type: String
    },
    autoPlay: {
        type: Boolean
    },
    address: {
        type: String
    },
    amount: {
        type: Number
    },
    encoreTime: {
        type: Number
    },
    pinCode: {
        type: Number
    },
    voting: {
        type: Boolean
    },
    votingTime: {
        type: Number
    },
    intervalSecond: {
        type: Number,
        default: 1000
    },
    openedSong: {
        songName: {
            type: String
        },
        songLink: {
            type: String
        },
        songDuration: {
            type: Number
        },
        isEncore: {
            type: Boolean,
            default: false
        },
        name: {
            type: String,
        },
        text: {
            type: String,
        }
    },
    votedSong: {
        type: {
            _id: {
                type: mongoose.Schema.Types.ObjectId
            },
            songName: {
                type: String
            },
            thumbnail: {
                type: String
            },
            singer: {
                type: String
            },
            songLink: {
                type: String
            },
            vote: {
                type: Number
            },
            songDuration: {
                type: Number
            }
        }
    },
    songOrder: [{
        thumbnail: {
            type: String
        },
        songName: {
            type: String
        },
        singer: {
            type: String
        },
        songLink: {
            type: String
        },
        isEncore: {
            type: Boolean,
            default: false
        },
        songDuration: {
            type: Number
        },
        name: {
            type: String,
            default: ''
        },
        text: {
            type: String,
            default: ''
        },
    }],
    votingSongs: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        },
        playlistID: {
            type: mongoose.Schema.Types.ObjectId
        },
        songName: {
            type: String
        },
        thumbnail: {
            type: String
        },
        singer: {
            type: String
        },
        songLink: {
            type: String
        },
        vote: {
            type: Number
        },
        songDuration: {
            type: Number
        }
    }],
    cafe: {
        type: String
    },
    playlist: {
        type: String
    }
})

const logSchema = new Schema({
    cafe: {
        type: String
    },
    encores: {
        songLink: {
            type: String
        },
        time: {
            type: String
        }
    },
    votes: [{
        voting: [{
            songLink: {
                type: String
            },
            vote: {
                type: Number
            },
        }],
        time: {
            type: String
        }
    }]
})

module.exports.admin = mongoose.model('admin', adminSchema);
module.exports.user = mongoose.model('user', userSchema);
module.exports.settings = mongoose.model('settings', settingsSchema);
module.exports.playlist = mongoose.model('song', playlistSchema);
module.exports.encore = mongoose.model('encore', encoreSchema);
module.exports.message = mongoose.model('message', messagesSchema);
module.exports.votingSongs = mongoose.model('votingSongs', votingSongsSchema);
module.exports.place = mongoose.model('place', placeSchema);
module.exports.logs = mongoose.model('log', logSchema);
