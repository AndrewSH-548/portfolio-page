using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace NoSignal
{
    /// <summary>
    /// Enumeration for the player's position state. Used primarily for animations.
    /// </summary>
    public enum PlayerState
    {
        StandLeft,
        StandRight,
        WalkLeft,
        WalkRight,
        AerialLeft,
        AerialRight,
        BoostLeft,
        BoostRight,
    }

    /// <summary>
    /// Player character.
    /// Inherits from object class.
    /// The player can move, jump, boost, and is animated.
    /// </summary>
    internal class Player : Object
    {
        //Window dimensions
        private int windowHeight;
        private int windowWidth;

        //Boosting integers
        private int boost = 60;
        private int bNum = 3;
        private int bNum2 = 0;

        //Keyboard states
        private KeyboardState prevKBstate;
        private KeyboardState KeyboardState;

        //Physical parameters
        private bool jump;
        private int jumpCount;
        private bool isGrounded = true;
        private double count = 0;
        private int speed = 3;

        //Instance of Enum
        private PlayerState state;

        //Animation variables
        private double timeCounter;
        private double timePerFrame;
        private int currentWalkFrame;
        private int currentBoostFrame;
        private bool isBoosting;

        //animation constants
        private const int frameWidth = 55;
        private const int frameHeight = 117;
        private const int walkFrameCount = 4;

        /// <summary>
        /// Player constructor, derived from object constructor. 
        /// Internally defines the animation-related numbers.
        /// </summary>
        /// <param name="windowHeight">The height of the game's window.</param>
        /// <param name="windowWidth">The width of the game's window.</param>
        /// <param name="texture">The object's appearance in-game.</param>
        /// <param name="rect">The rectangle to dictate the object's position.</param>
        /// <param name="topOfSprite">Whether the object's hitbox is at the top or bottom of its rectangle.</param>
        public Player(int windowHeight, int windowWidth, Texture2D texture, Rectangle rect, bool topOfSprite) : base(texture, rect, topOfSprite)
        {
            this.windowHeight = windowHeight;
            this.windowWidth = windowWidth;
            hitbox = new(rect.X, rect.Y + rect.Height - 5, rect.Width - 10, 7);

            //Defining animation variables
            currentWalkFrame = 1;
            currentBoostFrame = 1;
            timePerFrame = 0.2;
        }
        
        /// <summary>
        /// How much of the boost meter the player currently has
        /// </summary>
        public int Boost
        {
            get { return boost; }
            set { boost = value; }
        }

        /// <summary>
        /// The vertical speed at which the player is moving.
        /// </summary>
        public int Speed
        {
            get { return speed; }
            set { speed = value; }
        }

        /// <summary>
        /// Whether the player is on the ground or not.
        /// </summary>
        public bool IsGrounded
        {
            get { return isGrounded; }
            set { isGrounded = value; }
        }

        /// <summary>
        /// The player's "feet" which are simply a hitbox at the bottom of the sprite.
        /// </summary>
        public Rectangle Feet
        {
            get { return hitbox; }
            set { hitbox = value; }
        }

        /// <summary>
        /// The number of boost taps the player has left.
        /// </summary>
        public int BNum
        {
            get { return bNum; }
            set { bNum = value; }
        }

        /// <summary>
        /// The animation state the player is in.
        /// </summary>
        public PlayerState State
        {
            get { return state; }
        }

        /// <summary>
        /// Overriden update method.
        /// Handles the player's movement and animations.
        /// </summary>
        /// <param name="gameTime">The amount of time the game has been running.</param>
        public override void Update(GameTime gameTime)
        {
            
            //Keyboard states
            prevKBstate = KeyboardState;
            KeyboardState = Keyboard.GetState();

            //sets jump to true if user presses space bar one time
            if (KeyboardState.IsKeyDown(Keys.Space) && prevKBstate.IsKeyUp(Keys.Space) && isGrounded)
            {
                jump = true;
            }

            //actual jump action
            //if true the player moves upward in increments of 5 for 20 game ticks
            //After the ten game ticks jump is set to false and jumpcount (amount of ticks jump is true for) is set to 0
            if (jump == true)
            {
                speed = -5;
                if (jumpCount < 20)
                {
                    jumpCount++;
                    KeyboardState = Keyboard.GetState();

                    //the player can move left and right while jumping
                    if (KeyboardState.IsKeyDown(Keys.D))
                    {
                        X += 2;
                        if (X > windowWidth - 50)
                        {
                            X -= 2;
                        }
                    }
                    if (KeyboardState.IsKeyDown(Keys.A))
                    {
                        X -= 2;
                        if (X < -10)
                        {
                            X += 2;
                        }
                    }
                    if (KeyboardState.IsKeyUp(Keys.Space) && prevKBstate.IsKeyDown(Keys.Space))
                    {
                        jump = false;
                    }
                }
                else
                {
                    jump = false;
                    jumpCount = 0;
                }
            }

            //Boost action
            //If the player has boost and they press space in midair the player will rise in increments of 2
            //for as many game ticks as they hold space or until they run out of boost
            else if (KeyboardState.IsKeyDown(Keys.Space) && boost > -1)
            {

                if (prevKBstate.IsKeyUp(Keys.Space))
                {
                    isBoosting = true;
                    if (!Game1.GodMode)
                    {
                        bNum--;
                    }
                    bNum2 = 0;
                }
                if (bNum == -1)
                {
                    boost = 0;
                }
                if (bNum2 < 50 && bNum > 0)
                {
                    speed -= 1;
                    bNum2++;
                }
                speed = -4;
                if (!Game1.GodMode)
                {
                    boost--;
                }
                
                KeyboardState = Keyboard.GetState();

                //the player can move left and right while boosting
                if (KeyboardState.IsKeyDown(Keys.D))
                {
                    X += 2;
                    if (X > windowWidth - 50)
                    {
                        X -= 2;
                    }
                }
                if (KeyboardState.IsKeyDown(Keys.A))
                {
                    X -= 2;
                    if (X < -10)
                    {
                        X += 2;
                    }
                }
            }

            //if the player is not currently jumping or boosting the player will slow down and then begin to fall
            //count variable is used to make the player appear to slow down at the top
            //count inceases every game tick and every 7 multiples of count speed is increased until it equals 3
            else if (isGrounded == false)
            {
                count++;
                if (count % 7 == 0)
                {
                    if (speed < 6)
                    {
                        speed++;
                    }
                }

                //player can move left and rright while falling
                if (KeyboardState.IsKeyDown(Keys.D))
                {
                    X += 2;
                    if (X > windowWidth - 50)
                    {
                        X -= 2;
                    }
                }
                if (KeyboardState.IsKeyDown(Keys.A))
                {
                    X -= 2;
                    if (X < -10)
                    {
                        X += 2;
                    }
                }

                //Set isBoosting to false when the button is released
                //This may be relocated to wherever fits better
                if (KeyboardState.IsKeyUp(Keys.Space) && prevKBstate.IsKeyDown(Keys.Space))
                {
                    isBoosting = false;
                }
            }

            //while on the ground, the boost meter regenerates
            else if (isGrounded == true)
            {
                bNum = 3;
                if (Boost <= 60)
                {
                    boost += 2;
                }
                speed = 0;

                //the player can move while on the ground
                if (KeyboardState.IsKeyDown(Keys.D))
                {
                    X += 3;
                    if (X > windowWidth - 50)
                    {
                        X -= 3;
                    }
                }
                if (KeyboardState.IsKeyDown(Keys.A))
                {
                    X -= 3;
                    if (X < -10)
                    {
                        X += 3;
                    }

                }
            }

            //Call this every frame
            UpdateAnimation(gameTime);
            //FSM for changing the player's animation state
            switch (state)
            {
                case PlayerState.StandLeft:
                    if (KeyboardState.IsKeyDown(Keys.D) && !KeyboardState.IsKeyDown(Keys.Space) && !KeyboardState.IsKeyDown(Keys.LeftShift))        //Pressing only right
                    {
                        state = PlayerState.WalkRight;                                                                                              //State is walking right
                    }
                    else if (KeyboardState.IsKeyDown(Keys.A) && !KeyboardState.IsKeyDown(Keys.Space) && !KeyboardState.IsKeyDown(Keys.LeftShift))   //Pressing only left
                    {
                        state = PlayerState.WalkLeft;                                                                                               //State is walking left
                    }
                    else if (!isGrounded)                                                                                                           //Not on the ground
                    {
                        state = PlayerState.AerialLeft;                                                                                             //State is facing left in the air
                    }
                    break;
                
                case PlayerState.StandRight:
                    if (!isGrounded)                                                                                                                //Not on the ground
                    {
                        state = PlayerState.AerialRight;                                                                                            //State is facing right in the air
                    }
                    else
                    {
                        goto case PlayerState.StandLeft;                                                                                            //All other logic is the same
                    }
                    break;

                case PlayerState.WalkLeft:
                    if (KeyboardState.IsKeyDown(Keys.D) && KeyboardState.IsKeyUp(Keys.A))                                                           //If only left is up
                    {
                        state = PlayerState.WalkRight;                                                                                              //Pivot right
                    }
                    else if (KeyboardState.IsKeyUp(Keys.A) && KeyboardState.IsKeyUp(Keys.D))                                                        //If both are up
                    {
                        state = PlayerState.StandLeft;                                                                                              //State is stationary facing left
                    }
                    else if (!isGrounded)
                    {
                        state = PlayerState.AerialLeft;
                    }
                    break;

                case PlayerState.WalkRight:
                    if (KeyboardState.IsKeyDown(Keys.A) && KeyboardState.IsKeyUp(Keys.D))                                                           //If only right is up
                    {
                        state = PlayerState.WalkLeft;                                                                                               //Pivot left
                    }
                    else if (KeyboardState.IsKeyUp(Keys.A) && KeyboardState.IsKeyUp(Keys.D))                                                        //If both are up
                    {
                        state = PlayerState.StandRight;                                                                                             //State is stationary facing right
                    }
                    else if (!isGrounded)
                    {
                        state = PlayerState.AerialRight;
                    }
                    break;

                case PlayerState.AerialLeft:
                    if (isGrounded)                                                                                                                 //When landing
                    {
                        state = PlayerState.StandLeft;                                                                                              //State is facing left
                    }
                    else if (isGrounded && KeyboardState.IsKeyDown(Keys.A))                                                                         //Landing while moving
                    {
                        state = PlayerState.WalkLeft;                                                                                               //State is walking left
                    }
                    else if (isBoosting)                                                                                                            //When boost is pressed
                    {
                        state = PlayerState.BoostLeft;                                                                                              //State is boosting while facing left
                    }
                    break;
                case PlayerState.AerialRight:
                    if (isGrounded)                                                                                                                 //When landing
                    {
                        state = PlayerState.StandRight;                                                                                             //State is facing right
                    }
                    else if (isGrounded && KeyboardState.IsKeyDown(Keys.D))                                                                         //Landing while moving
                    {
                        state = PlayerState.WalkRight;                                                                                              //State is walking right
                    }
                    else if (isBoosting)                                                                                                            //When boost is pressed
                    {
                        state = PlayerState.BoostRight;                                                                                             //State is boosting while facing right
                    }
                    break;

                case PlayerState.BoostLeft:
                    if (!KeyboardState.IsKeyDown(Keys.Space) && !isGrounded)                                                                        //Not boosting but still in the air
                    {
                        state = PlayerState.AerialLeft;                                                                                             //State is facing left in the air
                    }
                    else if (isGrounded && KeyboardState.IsKeyDown(Keys.A))                                                                         
                    {
                        state = PlayerState.WalkLeft;
                    }
                    else if (isGrounded)
                    {
                        state = PlayerState.StandLeft;
                    }
                    break;
                case PlayerState.BoostRight:
                    if (!KeyboardState.IsKeyDown(Keys.Space) && !isGrounded)                                                                        //Not boosting but still in the air
                    {
                        state = PlayerState.AerialRight;                                                                                            //State is facing right in the air
                    }
                    else if (isGrounded && KeyboardState.IsKeyDown(Keys.D))
                    {
                        state = PlayerState.WalkRight;
                    }
                    else if (isGrounded)
                    {
                        state = PlayerState.StandRight;
                    }
                    break;
            }
        }

        /// <summary>
        /// Changes the frame number depending on the amount of time passed.
        /// </summary>
        /// <param name="gameTime">The time the game has been running.</param>
        public void UpdateAnimation (GameTime gameTime)
        {
            //Always increases
            timeCounter += gameTime.ElapsedGameTime.TotalSeconds;

            if (timeCounter >= timePerFrame)            //If the frame time passed
            {
                currentWalkFrame++;                         //Advance the frame
                if (currentWalkFrame > walkFrameCount)
                {
                    currentWalkFrame = 1;                   //Reset if the limit is passed
                }
                if (currentBoostFrame < 2)                  
                {
                    currentBoostFrame++;
                }
                timeCounter -= timePerFrame;            //Remove the used time
            }
        }

        /// <summary>
        /// Draws a different sprite depending on the player's movement state
        /// </summary>
        /// <param name="sb">The sprite batch to draw on.</param>
        /// <param name="tint">The color to draw the sprites.</param>
        public override void Draw(SpriteBatch sb, Color tint)
        {
            //Check the player's state
            switch (state)
            {
                //If the player is in this state
                case PlayerState.StandLeft:
                    //Call the appropriate method
                    DrawIdle(sb, SpriteEffects.FlipHorizontally);
                    break;
                case PlayerState.StandRight:
                    //Don't flip for right-facing sprites
                    DrawIdle(sb, SpriteEffects.None);
                    break;

                case PlayerState.WalkLeft:
                    DrawWalking(sb, SpriteEffects.FlipHorizontally);
                    break;
                case PlayerState.WalkRight:
                    DrawWalking(sb, SpriteEffects.None);
                    break;

                case PlayerState.AerialLeft:
                    DrawAerial(sb, SpriteEffects.FlipHorizontally);
                    break;
                case PlayerState.AerialRight:
                    DrawAerial(sb, SpriteEffects.None);
                    break;

                case PlayerState.BoostLeft:
                    DrawBoosting(sb, SpriteEffects.FlipHorizontally);
                    break;
                case PlayerState.BoostRight:
                    DrawBoosting(sb, SpriteEffects.None);
                    break;
            }
        }

        #region DrawingMethods
        /// <summary>
        /// Draws the idle frame (which should be at 0, 0)
        /// </summary>
        /// <param name="sb">The spritebatch to draw on.</param>
        /// <param name="effects">Whether the sprite should be flipped.</param>
        private void DrawIdle(SpriteBatch sb, SpriteEffects effects)
        {
            sb.Draw(texture,
                objRect,
                new Rectangle(0, 0, frameWidth, frameHeight),
                Color.White,
                0,
                Vector2.Zero,
                effects,
                1.0f);
        }

        /// <summary>
        /// Draws the walking animation using the current frame number
        /// </summary>
        /// <param name="sb">The spritebatch to draw on.</param>
        /// <param name="effects">Whether the sprite should be flipped.</param>
        private void DrawWalking(SpriteBatch sb, SpriteEffects effects)
        {
            sb.Draw(texture,
                objRect,
                new Rectangle(frameWidth * currentWalkFrame, 0, frameWidth, frameHeight),
                Color.White,
                0,                                          
                Vector2.Zero,                               
                effects,
                1.0f);                                      
        }

        /// <summary>
        /// Draws the aerial frame (taken from a frame in the walk cycle)
        /// </summary>
        /// <param name="sb">The spritebatch to draw on.</param>
        /// <param name="effects">Whether the sprite should be flipped.</param>
        private void DrawAerial(SpriteBatch sb, SpriteEffects effects)
        {
            sb.Draw(texture,
                objRect,
                new Rectangle(frameWidth, 0, frameWidth, frameHeight),
                Color.White,
                0,
                Vector2.Zero,
                effects,
                1.0f);
        }

        /// <summary>
        /// Draws the boosting animation by adding the walk frame total to the offset
        /// </summary>
        /// <param name="sb">The spritebatch to draw on.</param>
        /// <param name="effects">Whether the sprite should be flipped.</param>
        private void DrawBoosting(SpriteBatch sb, SpriteEffects effects)
        {
            sb.Draw(texture,
                objRect,
                new Rectangle(frameWidth * (walkFrameCount + currentBoostFrame), 0, frameWidth, frameHeight),
                Color.White,
                0,
                Vector2.Zero,
                effects,
                1.0f);
        }
        #endregion
    }
}
