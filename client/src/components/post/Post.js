import React, { useContext, useEffect } from "react";
import "./Post.css";
import { MoreVert } from "@mui/icons-material";
import DeleteIcon from '@material-ui/icons/Delete';
// import { Users } from "../../dummyData";
import { useState } from "react";
import { format } from "timeago.js";
import Comment from "../Comment/Comment";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Post({ post, username }) {
  const[com,setcom]=useState(false);
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const {user: currentUser} = useContext(AuthContext)

  // console.log("HI")
  // console.log (post)

  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  
  useEffect(()=>{
    setIsLiked(post.likes.includes(currentUser._id))
  },[currentUser._id, post.likes])
  
  const likeHandler = async () => {
    await axios.put("/posts/"+post._id+"/like", {userId: currentUser._id})
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };
  const handleDelete= async ()=>{
       console.log(post.userId, currentUser._id)
     if (window.confirm("Do you want to Delete the post!") === true) {
       
         await axios.delete("/posts/"+post._id, {userId: currentUser._id})
        // window.location.reload();
       }
   }

  useEffect(() => {
    const fetchUser = async () => {
      try{

      }catch(err){
        console.log(err)
      }
      const res = await axios.get(`/users?userId=${post.userId}`);
      // console.log(res);
      setUser(res.data);
    };
    fetchUser();
  }, [post.userId]);
  
  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <NavLink to = {`/profile/${user.username}`}>
              <img
                className="postProfileImg"
                src={ user.profilePicture ? PF + user.profilePicture : PF + "user/blank.jpg"}
                alt=""
              />
            </NavLink>
            <span className="postUsername">{user.username}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          <div className="postTopRight">
          {
            (username && (user._id === currentUser._id)) ? 
            <DeleteIcon style={{cursor: "pointer"}} onClick={handleDelete}/>:
            <MoreVert /> 
          }
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{post?.desc}</span>
          <img className="postImg" src={PF + post.img} alt="" />
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="likeIcon"
              src={`${PF}like.png`}
              onClick={likeHandler}
              alt=""
            />
            {/* <img
              className="likeIcon"
              src={`${PF}heart.png`}
              onClick={likeHandler}
              alt=""
            /> */}
            <span className="postLikeCounter">{like} people like it</span>
          </div>
          <div className="postBottomRight">
            {/* <span className="postCommentText" onClick={()=>setcom(!com)}>comments</span> */}
          </div>
        </div>
      </div>
      {
        com && <Comment />
      }
    </div>
  );
}
