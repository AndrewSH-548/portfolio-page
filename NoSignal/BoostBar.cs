using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace NoSignal
{
    /// <summary>
    /// Boost bar.
    /// A UI element that displays the player's ability to boost.
    /// Includes the main meter as well as 3 lights for the 3 taps the player can perform in one jump.
    /// </summary>
    internal class BoostBar
    {
        //Position vector2
        private static Vector2 position;

        //Textures
        private static Texture2D background;
        private static Texture2D emptyBar;
        private static Texture2D fullBar;
        private static Texture2D lightOff;
        private static Texture2D lightOn;

        //Boost variables
        private static int boostNumber;
        private static int boostMeter;

        //constant offsets
        private static readonly Vector2 barOffset = new Vector2(8, 58);
        private static readonly Vector2 lightOffset = new Vector2(20, 58);
        private const int barSegmentHeight = 16;
        private const int lightDistance = 33;

        /// <summary>
        /// Acts as a constructor, loading all the necessary assets and position
        /// </summary>
        /// <param name="location">Where the boost bar is drawn.</param>
        /// <param name="bg">The background of the boost bar.</param>
        /// <param name="empty">The empty bar sprite.</param>
        /// <param name="full">The full bar sprite.</param>
        /// <param name="dim">The dim light sprite.</param>
        /// <param name="lit">The active light sprite.</param>
        public static void Initialize(Vector2 location, Texture2D bg, Texture2D empty, Texture2D full, Texture2D dim, Texture2D lit)
        {
            position = location;
            background = bg;
            emptyBar = empty;
            fullBar = full;
            lightOff = dim;
            lightOn = lit;
        }

        /// <summary>
        /// Obtains the boost variables from the player class by updating each frame.
        /// </summary>
        /// <param name="player">The player to obtain information from.</param>
        public static void Update(Player player)
        {
            boostNumber = player.BNum;
            boostMeter = player.Boost / 12;
        }

        /// <summary>
        /// Draws the boost bar and its parts.
        /// </summary>
        /// <param name="sb">The sprite batch to draw on.</param>
        public static void Draw(SpriteBatch sb)
        {
            sb.Draw(background, position, Color.White);
            DrawBoostMeter(sb);
            DrawLights(sb);
        }

        /// <summary>
        /// Draws the boost meter according to the amount of boost the player has left.
        /// </summary>
        /// <param name="sb">The sprite batch to draw on.</param>
        private static void DrawBoostMeter(SpriteBatch sb)
        {
            sb.Draw(emptyBar, position + barOffset, Color.White);
            for (int i = 0; i < boostMeter; i++)
            {
                sb.Draw(fullBar,
                   new Vector2(position.X + barOffset.X, position.Y + barOffset.Y + (barSegmentHeight * i)),
                   new Rectangle(0, 0, fullBar.Width, 16),
                   Color.White);
            }
            if (boostMeter > 0)
            {
                
            }
            
        }
        
        /// <summary>
        /// Draws the lights that indicate the tap count for boosting.
        /// </summary>
        /// <param name="sb">The sprite batch to draw this on.</param>
        private static void DrawLights(SpriteBatch sb)
        {
            //If the boost count is at a certain number
            if (boostNumber >= 1)
            {
                //Draw this lit up
                sb.Draw(lightOn, position + lightOffset, Color.White);
            }
            else
            {
                //otherwise it's dim
                sb.Draw(lightOff, position + lightOffset, Color.White);
            }

            if (boostNumber >= 2)
            {
                //Draw this lower in position than the previous
                sb.Draw(lightOn, new Vector2(position.X + lightOffset.X, position.Y + lightOffset.Y + lightDistance), Color.White);
            }
            else
            {
                sb.Draw(lightOff, new Vector2(position.X + lightOffset.X, position.Y + lightOffset.Y + lightDistance), Color.White);
            }

            if (boostNumber == 3)
            {
                sb.Draw(lightOn, new Vector2(position.X + lightOffset.X, position.Y + lightOffset.Y + lightDistance * 2), Color.White);
            }
            else
            {
                sb.Draw(lightOff, new Vector2(position.X + lightOffset.X, position.Y + lightOffset.Y + lightDistance * 2), Color.White);
            }
        }
    }
}
