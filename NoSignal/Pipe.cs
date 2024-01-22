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
    /// Pipe class, inherits from hazard and object class.
    /// Pipes are the only objects that rotate, which is handled here.
    /// </summary>
    internal class Pipe : Hazard
    {
        //Rotation related fields
        private float rotation;
        private float rotationVol;

        /// <summary>
        /// Pipe constructor, derived from hazard and object constructors.
        /// Includes the rotation speed.
        /// </summary>
        /// <param name="speedX">The horizontal speed of the pipe.</param>
        /// <param name="speedY">The vertical speed of the pipe.</param>
        /// <param name="texture">The pipe's appearance in-game.</param>
        /// <param name="rect">The rectangle to dictate the pipe's position.</param>
        /// <param name="rotation">The speed of rotation.</param>
        /// <param name="topOfSprite">Whether the pipe's hitbox is at the top or bottom of its rectangle.</param>
        /// <param name="type">The type of hazard this is.</param>
        public Pipe(int speedX, int speedY, Texture2D texture, Rectangle rect, float rotation, bool topOfSprite, string type) : base(speedX, speedY, texture, rect, topOfSprite, type)
        {
            this.rotationVol = rotation;
        }

        /// <summary>
        /// Overriden update method.
        /// Rotates the pipe using its given velocity.
        /// </summary>
        /// <param name="gameTime">The time the game has been running.</param>
        public override void Update(GameTime gameTime)
        {
            rotation -= MathHelper.ToRadians(rotationVol);
            base.Update(gameTime);
        }

        /// <summary>
        /// Draws the pipe using its rotation angle.
        /// </summary>
        /// <param name="sb">The spritebatch to draw on.</param>
        /// <param name="tint">The color to draw the object with.</param>
        public override void Draw(SpriteBatch sb, Color tint)
        {
            sb.Draw(texture,
                new Rectangle(X+objRect.Width/2,Y+objRect.Height/2,objRect.Width,objRect.Height), null,
                tint,
                rotation,
                new Vector2(texture.Width /2 , texture.Height/2), SpriteEffects.None, 0f);
        }
    }
}
