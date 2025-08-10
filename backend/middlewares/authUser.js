

// import jwt from 'jsonwebtoken';
// import 'dotenv/config';

// const authUser = async (req, res, next) => {
//   try {
//     const { token } = req.headers;
//     // console.log(token)
//     // console.log(req.body.userId)

//     if (!token) {
//     console.log("unauthorized")
//       return res.status(401).json({
//         success: false,
//         message: 'Not Authorized. Please log in again.',
//       });
//     }

//     // ✅ Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   // console.log(decoded)
//   req.body = req.body || {};
//    req.body.userId=decoded.id

//     next();
//   } catch (error) {
//     console.error('Token verification failed:', error.message);
//     res.status(401).json({
//       success: false,
//       message: 'Invalid or expired token.',
//     });
//   }
// };

// export { authUser };



import jwt from 'jsonwebtoken';
import 'dotenv/config';

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      console.log("unauthorized");
      return res.status(401).json({
        success: false,
        message: 'Not Authorized. Please log in again.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body = req.body || {};
    req.body.userId = decoded.id;

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export { authUser };
