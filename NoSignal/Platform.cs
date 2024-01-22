using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NoSignal
{
    /// <summary>
    /// Enumeration for the platform's type. Includes solid platforms, semi-solid platforms, and falling platforms.
    /// </summary>
    enum PlatformType
    {
        Solid,
        SemiSolid,
        Falling
    }

    /// <summary>
    /// Platform class.
    /// Inherits from Object class.
    /// Platforms are the main pieces of ground for the player to stand on during the game as they ascend the level.
    /// </summary>
    internal class Platform : Object, IAnimate
    {
        private PlatformType type;

        //Animation variables
        private double timeCounter;
        private double timePerFrame;
        private int currentFrame;

        //Animation constants
        private const int frameWidth = 95;
        private const int frameHeight = 22;
        private const int frameCount = 3;

        //Tiling sprite offsets
        private readonly Rectangle leftEdge = new Rectangle(0, 0, 11, 20);
        private readonly Rectangle rightEdge = new Rectangle(87, 0, 7, 20);
        private readonly Rectangle tile = new Rectangle(11, 0, 6, 20);

        /// <summary>
        /// The platform's hitbox.
        /// </summary>
        public Rectangle HitBox
        {
            get { return hitbox; }
            set { hitbox = value; }
        }
        /// <summary>
        /// The type of platform, as all behave mechanically differently
        /// </summary>
        public PlatformType Type
        {
            get { return type; }
            set { type = value; }
        }

        /// <summary>
        /// Constructor for platforms based on the constructor for objects.
        /// Includes the platform type.
        /// </summary>
        /// <param name="texture">The object's appearance in-game.</param>
        /// <param name="rect">The rectangle to dictate the object's position.</param>
        /// <param name="topOfSprite">Whether the object's hitbox is at the top or bottom of its rectangle.</param>
        /// <param name="type">The type of platfomr being created.</param>
        public Platform(Texture2D texture, Rectangle rect, bool topOfSprite, PlatformType type) : base(texture, rect, topOfSprite)
        {
            this.type = type;
            if (type == PlatformType.Solid)
                rect.Height = texture.Height;
            currentFrame = 0;
            timePerFrame = 0.5;
        }

        /// <summary>
        /// Overridden update method.
        /// Ensures the hitbox stays in this object's position.
        /// </summary>
        /// <param name="gameTime">The time the game has been running.</param>
        public override void Update(GameTime gameTime)
        {
            hitbox.Y = Y;
        }

        /// <summary>
        /// Checks whether this collides with another object.
        /// </summary>
        /// <param name="check">The colliding object</param>
        /// <returns></returns>
        public bool CheckCollision(Object check)
        {
            return hitbox.Intersects(check.hitbox);
        }

        /// <summary>
        /// Handles collision for solid platforms.
        /// </summary>
        /// <param name="check">The object colliding with this platform.</param>
        /// <returns>Whether the object intersects with this platform.</returns>
        public string SolidCollision(Object check)
        {
            if (SquareRect.Intersects(check.SquareRect))
            {
                // Collision detected, adjust check.SquareRect position accordingly
                if (check.SquareRect.Bottom >= SquareRect.Top && check.SquareRect.Bottom <= SquareRect.Top + 10)
                {
                    // check.SquareRect is on top of the platform, adjust their position to the top of the platform
                    check.Y = SquareRect.Top - check.SquareRect.Height;
                    return "true";
                }
                else if (check.SquareRect.Top <= hitbox.Bottom && check.SquareRect.Top >= hitbox.Bottom - 10)
                {
                    // check.SquareRect collided with the bottom of the platform, adjust their position accordingly
                    return "bottom";
                }
                else if (check.SquareRect.Right >= SquareRect.Left && check.SquareRect.Right <= SquareRect.Left + 10)
                {
                    // check.SquareRect collided with the left side of the platform, adjust their position accordingly
                    check.X = SquareRect.Left - check.SquareRect.Width;
                }
                else if (check.SquareRect.Left <= SquareRect.Right && check.SquareRect.Left >= SquareRect.Right - 10)
                {
                    // check.SquareRect collided with the right side of the platform, adjust their position accordingly
                    check.X = SquareRect.Right;
                }

                return "false";

            }
            return "false";
        }

        /// <summary>
        /// Overriden object draw method.
        /// Draws the platform in different ways depending on the type it is
        /// </summary>
        /// <param name="sb"></param>
        /// <param name="tint"></param>
        public override void Draw(SpriteBatch sb, Color tint)
        {
            //If the platform is a falling platform
            if (type == PlatformType.Falling)
            {
                //Draw it using the rect as the destination.
                //Source rectangle is whichever frame it is in.
                sb.Draw(texture,
                objRect,
                new Rectangle(frameWidth * currentFrame, 0, frameWidth, frameHeight),
                Color.White);
            }
            //if the platform is solid or semi-solid
            else
            {
                //Create brush at the object's origin
                Vector2 brush = new(objRect.X, objRect.Y);

                //Draw the left edge and move the brush forward
                DrawLeftEdge(sb, brush);
                brush.X += leftEdge.Width;

                //Draw the tiles as many times as given by the width of the rect
                for (int i = 0; i < objRect.Width / 6; i++)
                {
                    DrawTile(sb, brush);
                    brush.X += tile.Width;
                }

                //Draw the right edge
                DrawRightEdge(sb, brush);
            }
        }

        /// <summary>
        /// Changes the frame number depending on the amount of time passed.
        /// </summary>
        /// <param name="gameTime"></param>
        public void UpdateAnimation(GameTime gameTime)
        {
            //Always increases
            timeCounter += gameTime.ElapsedGameTime.TotalSeconds;

            if (timeCounter >= timePerFrame)            //If the frame time passed
            {
                if(currentFrame < frameCount - 1)
                {
                    currentFrame++;                         //Advance the frame
                }
                timeCounter -= timePerFrame;            //Remove the used time
            }
        }

        #region DrawingMethods
        /// <summary>
        /// Draws the left edge of the platform.
        /// </summary>
        /// <param name="sb">The sprite batch to draw on.</param>
        /// <param name="position">Where to draw this piece.</param>
        private void DrawLeftEdge(SpriteBatch sb, Vector2 position)
        {
            sb.Draw(texture, position, leftEdge, Color.White);
        }

        /// <summary>
        /// Draws a tile of the platform.
        /// </summary>
        /// <param name="sb">The sprite batch to draw on.</param>
        /// <param name="position">Where to draw this piece.</param>
        private void DrawTile(SpriteBatch sb, Vector2 position)
        {
            sb.Draw(texture, position, tile, Color.White);
        }

        /// <summary>
        /// Draws the right edge of the platform.
        /// </summary>
        /// <param name="sb">The sprite batch to draw on.</param>
        /// <param name="position">Where to draw this piece.</param>
        private void DrawRightEdge(SpriteBatch sb, Vector2 position)
        {
            sb.Draw(texture, position, rightEdge, Color.White);
        }

        #endregion
    }
}
