using Microsoft.Xna.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NoSignal
{
    /// <summary>
    /// Animation interface.
    /// Any object with animations needs all methods from this interface.
    /// </summary>
    internal interface IAnimate
    {
        /// <summary>
        /// Changes the frame the object is displayed in depending on the game time.
        /// </summary>
        /// <param name="gameTime">The time the game has been running.</param>
        void UpdateAnimation(GameTime gameTime);
    }
}
