using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NoSignal
{
    

    internal class TextBox
    {
        //Required fields
        private static Vector2 position;
        private static Texture2D sprite;
        private static SpriteFont textFont;

        private static bool isActive;

        public static bool IsActive
        {
            get { return isActive; }
        }

        // rigid corner source rectangles
        private static readonly Rectangle lowerLeftOffset = new(0, 150, 45, 102);
        private static readonly Rectangle lowerRightOffset = new(180, 150, 51, 102);
        private static readonly Rectangle upperLeftOffset = new(0, 0, 15, 15);
        private static readonly Rectangle upperRightOffset = new(216, 0, 15, 15);

        private enum CornerType
        {
            LowerLeft,
            LowerRight,
            UpperLeft,
            UpperRight,
        }

        // tile source rectangles
        private static readonly Rectangle verticalTile = new(0, 15, 15, 15);
        private static readonly Rectangle horizontalTile = new(15, 0, 15, 15);
        private static readonly Rectangle backgroundTile = new(15, 15, 15, 15);

        // local tiletype enum 
        private enum TileType
        {
            Vertical,
            Horizontal,
            Background
        }
        
        /// <summary>
        /// Loads the necessary content for this to work.
        /// </summary>
        /// <param name="texture">The text box sprite</param>
        /// <param name="font"></param>
        public static void Initialize(Texture2D texture, SpriteFont font)
        {
            sprite = texture;
            textFont = font;
            isActive = false;
        }

        /// <summary>
        /// Activates the Textbox, allowing it to be seen.
        /// </summary>
        public static void Activate()
        {
            isActive = true;
        }

        /// <summary>
        /// Only meant to deactivate the textbox when necessary.
        /// </summary>
        /// <param name="state"></param>
        /// <param name="prevState"></param>
        public static void Update(KeyboardState state, KeyboardState prevState)
        {
            if (isActive && Game1.SingleKeyPress(Keys.Space, state, prevState))
            {
                isActive = false;
            }
        }

        /// <summary>
        /// Draws the text box by calling other draw methods.
        /// </summary>
        /// <param name="sb">The spritebatch being drawn on.</param>
        /// <param name="text">The text to write on the box.</param>
        /// <param name="height">The height of the text box.</param>
        public static void Draw(SpriteBatch sb, string text, int height)
        {
            // This "brush" is a location that will let us know where we're drawing at any time.
            // It will start at the lower left corner's position.
            Vector2 brush = new Vector2(30, 768 - lowerLeftOffset.Height);

            //Start with lower extremes
            DrawCorner(sb, CornerType.LowerLeft, brush);                    // Draw sprite
            brush.X += lowerLeftOffset.Width;                               // Move brush to the ending edge of the sprite
            
            while (brush.X < 768 - lowerRightOffset.Width - 30)              // Repeat this until the posiiton is correct
            {
                DrawTile(sb, TileType.Horizontal, brush);
                brush.X += horizontalTile.Width;
            }

            DrawCorner(sb, CornerType.LowerRight, brush);
            brush.Y -= verticalTile.Height;

            for (int i = 0; i < height; i++)                                    //Create 15 rows
            {
                //Set position to the left side
                brush.X = 30;                               
                
                //Draw the left border
                DrawTile(sb, TileType.Vertical, brush);                     
                brush.X += verticalTile.Width;

                //Draw background tiles across the whole screen
                while (brush.X < 768 - lowerRightOffset.Width)                  
                {
                    DrawTile(sb, TileType.Background, brush);
                    brush.X += backgroundTile.Width;
                }

                //This won't align with the 15 x 15 grid, so we move it by a different increment
                DrawTile(sb, TileType.Background, brush);
                brush.X += 6;
                 
                //Draw the right border
                DrawTile(sb, TileType.Vertical, brush);
                brush.Y -= backgroundTile.Height;
            }

            //Set up top border drawing
            brush.X = 30;

            //Top left corner
            DrawCorner(sb, CornerType.UpperLeft, brush);
            brush.X += upperLeftOffset.Width;

            //Draw top border
            while(brush.X < 768 - lowerRightOffset.Width)
            {
                DrawTile(sb, TileType.Horizontal, brush);
                brush.X += horizontalTile.Width;
            }   

            //Increment it specifically
            DrawTile(sb, TileType.Horizontal, brush);
            brush.X += 6;
            //Draw final corner
            DrawCorner(sb, CornerType.UpperRight, brush);
            
            //Set position to write text
            brush.X = 30 + upperLeftOffset.Width + horizontalTile.Width * 2;
            
            //Always write the return first
            brush.Y = 768 - lowerLeftOffset.Height - 40;
            if (Game1.currentState == Game1.GameState.Controls)
            {
                sb.DrawString(textFont, "Hit ENTER to begin", brush, Color.Lime);
            }
            else if (Game1.currentState == Game1.GameState.Pause)
            {
                sb.DrawString(textFont, "Hit BACKSPACE to continue", brush, Color.Lime);
            }
            else
            {
                sb.DrawString(textFont, "Hit SPACE to return", brush, Color.Lime);
            }
            
            //Write the given text
            brush.Y -= backgroundTile.Height * (height - 3);
            sb.DrawString(textFont, text, brush, Color.Lime);   
        }

        /// <summary>
        /// Draws a tile of the text box.
        /// </summary>
        /// <param name="sb">The spritebatch being drawn on.</param>
        /// <param name="type">The type of tile to be drawn.</param>
        /// <param name="position">Where the object is being drawn.</param>
        private static void DrawTile(SpriteBatch sb, TileType type, Vector2 position)
        {
            //Decide the source rectangle via the enum
            Rectangle tileOffset;
            switch (type)
            {
                case TileType.Vertical:
                    tileOffset = verticalTile;
                    break;
                case TileType.Horizontal:
                    tileOffset = horizontalTile;
                    break;
                default:                                        // Label like this to compile correctly
                    tileOffset = backgroundTile;
                    break;
            }
            
            //Draw in the given location
            sb.Draw(sprite,
                position,
                tileOffset,
                Color.White,
                0,
                Vector2.Zero,
                1.0f,
                SpriteEffects.None,
                1.0f);
        }

        /// <summary>
        /// Draws the corner of the text box
        /// </summary>
        /// <param name="sb">The spritebatch being drawn on.</param>
        /// <param name="type">The type of corner to be drawn.</param>
        /// <param name="position">Where the object is drawn.</param>
        private static void DrawCorner(SpriteBatch sb, CornerType type, Vector2 position)
        {
            //Decide the source rectangle via the enum
            Rectangle tileOffset;
            switch (type)
            {
                case CornerType.LowerLeft:
                    tileOffset = lowerLeftOffset;
                    break;
                case CornerType.LowerRight:
                    tileOffset = lowerRightOffset;
                    break;
                case CornerType.UpperLeft:
                    tileOffset = upperLeftOffset;
                    break;
                default:                                        // Label like this to compile correctly
                    tileOffset = upperRightOffset;
                    break;
            }

            //Draw in the given location
            sb.Draw(sprite,
                position,
                tileOffset,
                Color.White,
                0,
                Vector2.Zero,
                1.0f,
                SpriteEffects.None,
                1.0f);
        }

    }
}
