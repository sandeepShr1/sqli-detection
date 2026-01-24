import React from 'react';
import { Rating } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import profilePng from "../../images/Profile.png"

const ReviewCard = ({ review, deleteReviewHandler, currentUserId }) => {
      const options = {
            size: "large",
            value: review.rating,
            readOnly: true,
            precision: 0.5,
      }

      const isOwner = currentUserId === review.userId;
      const userName = review.name || `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim() || 'Anonymous';

      return (
            <div className="reviewCard">
                  <img src={profilePng} alt="User" />
                  <p>{userName}</p>
                  <Rating {...options} />
                  <span className="reviewComment">{review.comment}</span>
                  {isOwner && (
                        <button
                              onClick={() => deleteReviewHandler(review.id)}
                              className="deleteReviewBtn"
                        >
                              <DeleteIcon /> Delete
                        </button>
                  )}
            </div>
      )
}

export default ReviewCard;