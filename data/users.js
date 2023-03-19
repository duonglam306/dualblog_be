import bcrypt from 'bcryptjs';
const users = [
    {
        email: "duonglt@gmail.com",
        password: bcrypt.hashSync("123456", 10),
        username: "Duong Lam Thanh",
        bio: "Intern Developer",
        image: "https://i.pinimg.com/236x/72/60/8a/72608a5a2f623de8be385c333eb2b626.jpg",
        followList: [],
        subscriberList: [],
    },
    {
        email: "duypm@gmail.com",
        password: bcrypt.hashSync("123456", 10),
        username: "Duy Pham Minh",
        bio: "Intern Developer",
        image: "https://i.pinimg.com/236x/58/85/4d/58854db138cb76fab2d3c2aeee2484c2.jpg",
        followList: [],
        subscriberList: [],
    },
    {
        email: "triettha@gmail.com",
        password: bcrypt.hashSync("123456", 10),
        username: "Triet Tran Huu Anh",
        bio: "Intern Developer",
        image: "https://i.pinimg.com/236x/29/41/93/294193de005976996a42f8070b538ff3.jpg",
        followList: [],
        subscriberList: [],
    },
    {
        email: "quyenkm@gmail.com",
        password: bcrypt.hashSync("123456", 10),
        username: "Quyen Khong Manh",
        bio: "Intern Developer",
        image: "https://i.pinimg.com/236x/95/e5/46/95e54665374285a566dc56a91f8e00eb.jpg",
        followList: [],
        subscriberList: [],
    },
    {
        email: "chaunhm@gmail.com",
        password: bcrypt.hashSync("123456", 10),
        username: "Chau Nguyen Hoang Minh",
        bio: "Intern Developer",
        image: "https://i.pinimg.com/236x/31/d7/33/31d733469baa6e4912a587615896fdd6.jpg",
        followList: [],
        subscriberList: [],
    },
];

export default users;
