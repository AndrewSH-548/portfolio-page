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
    /// Hazard class, inherits from object class.
    /// Hazards are objects that will kill the player and cause a game over upon contact.
    /// Hazards move in certain directions with certain speeds.
    /// </summary>
    internal class Hazard : Object
    {
        //Necessary fields
        private string type;
        private int speedY;
        private int speedX;

        /// <summary>
        /// The vertical speed of the hazard.
        /// </summary>
        public int SpeedY
        {
            get { return speedY; }
            set { speedY = value; }
        }

        /// <summary>
        /// The horizontal speed of the hazard.
        /// </summary>
        public int SpeedX
        {
            get { return speedX; }
            set { speedX = value; }
        }

        /// <summary>
        /// Hazard constructor, with hitbox sizes and positions dependent on its type.
        /// </summary>
        /// <param name="SpeedX">The horizontal speed of the hazard.</param>
        /// <param name="SpeedY">The vertical speed of the hazard.</param>
        /// <param name="texture">The hazard's appearance in-game.</param>
        /// <param name="rect">The rectangle to dictate the hazard's position.</param>
        /// <param name="topOfSprite">Whether the hazard's hitbox is at the top or bottom of its rectangle.</param>
        /// <param name="type">The type of hazard this is.</param>
        public Hazard(int SpeedX, int SpeedY, Texture2D texture, Rectangle rect, bool topOfSprite, string type) : base(texture, rect, topOfSprite)
        {
            this.type = type;
            this.speedY = SpeedY;
            this.speedX = SpeedX;
            this.objRect = rect;
            if (type == "rock" || type == "pipe")
            {
                Y = -100;
            }
            if (type == "rock")
            {
                hitbox = new Rectangle(rect.X+30,rect.Y+30, rect.Width-50,rect.Height-50);
               
            }
            if (type == "pipe")
            {
                hitbox = new Rectangle(rect.X+20,rect.Y-20,rect.Width-40,rect.Width-40);
            }
        }

        /// <summary>
        /// Overriden update method.
        /// Handles the movement of hazards.
        /// </summary>
        /// <param name="gameTime">The time the game has been running.</param>
        public override void Update(GameTime gameTime)
        {
            if (type == "rock" || type == "pipe")
            {
                Y += speedY;
            }
            if(type == "rock")
            {
                hitbox.Y = objRect.Y+30;
                hitbox.X = objRect.X + 30;
            }
            if(type == "pipe")
            {
                X += speedX;
                hitbox.Y = objRect.Y - 20;
                hitbox.X = objRect.X + 20;
            }
        }

        /// <summary>
        /// Checks whether the given object collides with this hazard.
        /// </summary>
        /// <param name="check">The object to check collision with.</param>
        /// <returns>True if the objects collide, false if they don't.</returns>
        public bool CheckCollision(Object check)
        {
            if (type == "rock" || type == "pipe")
            {
                return hitbox.Intersects(check.SquareRect);
            }
            return objRect.Intersects(check.SquareRect);
        }
    }
}
