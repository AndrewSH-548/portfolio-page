using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace NoSignal
{
    /// <summary>
    /// Basic heritable object class.
    /// Objects have textures, position rectangles, and hitboxes.
    /// They can draw themselves and update themselves.
    /// </summary>
    abstract class Object
    {
        //Necessary fields
        protected Texture2D texture;
        protected Rectangle objRect;
        internal Rectangle hitbox;

        /// <summary>
        /// Reference to the bounds of this object. Cannot be changed.
        /// </summary>
        public Rectangle SquareRect
        {
            get { return objRect; }
        }

        /// <summary>
        /// X position of the upper-left corner of the GameObject
        /// </summary>
        public int X
        {
            get { return objRect.X; }
            set { objRect.X = value; }
        }

        /// <summary>
        /// Y position of the upper-left corner of the GameObject
        /// </summary>
        public int Y
        {
            get { return objRect.Y; }
            set { objRect.Y = value; }
        }

        /// <summary>
        /// Game object constructor.
        /// </summary>
        /// <param name="texture">The object's appearance in-game.</param>
        /// <param name="rect">The rectangle to dictate the object's position.</param>
        /// <param name="topOfSprite">Whether the object's hitbox is at the top or bottom of its rectangle.</param>
        public Object(Texture2D texture, Rectangle rect, bool topOfSprite)
        {
            this.texture = texture;
            this.objRect = rect;
           
            if (topOfSprite)
                this.hitbox = new Rectangle(rect.X, rect.Y+1, rect.Width, 7);
            else
                this.hitbox = new Rectangle(rect.X, rect.Y + rect.Height - 5, rect.Width, 7);
        }

        /// <summary>
        /// Simple drawing method for objects.
        /// </summary>
        /// <param name="sb">The spritebatch to draw on.</param>
        /// <param name="tint">The color to draw the object with.</param>
        public virtual void Draw(SpriteBatch sb, Color tint)
        {
            sb.Draw(texture,
                objRect,
                tint);               
        }

        /// <summary>
        /// Abstract update method.
        /// Meant to be overriden by specific objects that inherit from this class.
        /// </summary>
        /// <param name="gameTime">The time the game has been running.</param>
        public abstract void Update(GameTime gameTime);
    }
}
