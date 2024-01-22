using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NoSignal
{
    /// <summary>
    /// Spark class, inheriting from Hazard and object classes.
    /// Sparks move around platforms and kill the player upon contact.
    /// </summary>
    internal class Spark : Hazard
    {
        //Host platform data
        protected Platform hostPlat;
        protected int hostPlatX;
        protected int hostPlatY;
        protected int hostPlatLength;
        protected int hostPlatHeight;

        //Distance traveled
        protected int distTraveledX;
        protected int distTraveledY;

        /// <summary>
        /// The horizontal distance traveled by the spark.
        /// </summary>
        public int DistTraveledX
        {
            get { return distTraveledX; }
            set { distTraveledX = value; }
        }

        /// <summary>
        /// The vertical distance traveled by the spark.
        /// </summary>
        public int DistTraveledY
        {
            get { return distTraveledY; }
            set { distTraveledY = value; }
        }

        /// <summary>
        /// Spark constructor. Handles its starting position based on the host platform.
        /// </summary>
        /// <param name="speedX">The horizontal speed of the spark.</param>
        /// <param name="speedY">The vertical speed of the spark.</param>
        /// <param name="texture">The spark's appearance in-game.</param>
        /// <param name="rect">The rectangle to dictate the spark's position.</param>
        /// <param name="topOfSprite">Whether the spark's hitbox is at the top or bottom of its rectangle.</param>
        /// <param name="type">The type of hazard this is.</param>
        /// <param name="hostPlat">The platform the spark is moving around.</param>
        public Spark(int speedX, int speedY, Texture2D texture, Rectangle rect, bool topOfSprite, string type
            , Platform hostPlat)
            : base(speedX, speedY, texture, rect, topOfSprite, type)
        {
            //The X and Y speed of this object.  These start at 0 because the object's X and Y speed
            //will get updated as it meets each conditional based on its location relative to the platform.
            this.SpeedX = 0;
            this.SpeedY = 0;
            this.hostPlat = hostPlat;
            this.texture = texture;

           // Sets the reference to the host platform's X coordinate...
            this.hostPlatX = hostPlat.X;

            //...Y coordinate...
            this.hostPlatY = hostPlat.Y;

            //...Platform Width and Platform Height.
            this.hostPlatLength = hostPlat.HitBox.Width;
            this.hostPlatHeight = hostPlat.HitBox.Height;

            //Holds the tecture for the object


            //Holds the rectangle that acts as the hitbox for the object


            this.objRect = new Rectangle(hostPlat.X, hostPlat.Y - 30, 30, 30);
            DistTraveledX = 0;
            DistTraveledY = 0;
        }

        /// <summary>
        /// Uses conditionals to track where the spark is, then adjusts its movement accordingly
        /// KNOWN ISSUE: DistTraveledY isn't updating, unsure as to why
        /// </summary>
        /// <param name="gameTime">The time the game has been running.</param>
        public override void Update(GameTime gameTime)
        {


            if (DistTraveledX < hostPlatLength && DistTraveledY < hostPlatHeight)
            {
                this.objRect.X += 2;
                DistTraveledX += 2;
            }

            else if (DistTraveledX >= hostPlatLength && DistTraveledY < hostPlatHeight + 45)
            {
                this.objRect.Y += 1;
                DistTraveledY += 1;
            }

            if (DistTraveledX >= -30 && DistTraveledY >= hostPlatHeight + 45)
            {
                this.objRect.X -= 2;
                DistTraveledX -= 2;
            }

            else if (DistTraveledX < hostPlatLength && DistTraveledY >= 0)
            {
                this.objRect.Y -= 1;
                DistTraveledY -= 1;
            }

            #region Old Code
            ////if the spark is in the top left corner of the platform, move across the top of the platform...
            //if (this.objRect.X == hostPlatX && this.objRect.Y == hostPlatY)
            //{
            //    this.objRect.X += 3;
            //}

            ////...Until it reaches the top right corner of the platform, in which case it moves down the right side
            //else if (this.objRect.X == hostPlatLength && this.objRect.Y == hostPlatY)
            //{
            //    this.objRect.Y += 1;
            //}

            ////Once it's reached the lower right corner, it slides along the bottom to the lower left corner...
            //else if (this.objRect.X == hostPlatX + hostPlatLength && this.objRect.Y == hostPlatY - hostPlatHeight)
            //{
            //    this.objRect.X -= 3;
            //}

            ////...then moves up the left side of the platform back to its original starting position
            //else if (this.objRect.X == hostPlatX && this.objRect.Y == hostPlatY - hostPlatHeight)
            //{
            //    this.objRect.Y -= 1;
            //}
            #endregion

            base.Update(gameTime);
        }
    }
}
