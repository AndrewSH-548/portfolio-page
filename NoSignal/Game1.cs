using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using System;
using System.Collections.Generic;
using System.Runtime.ExceptionServices;
using System.Collections;
using System.Net.Security;
using System.Runtime.CompilerServices;
using System.IO;
using System.Diagnostics;
using System.Globalization;
using System.Security.Cryptography;


namespace NoSignal
{
    public class Game1 : Game
    {
        private GraphicsDeviceManager _graphics;
        private SpriteBatch _spriteBatch;

        //window height/width
        private int windowWidth;
        private int windowHeight;

        //Keyboard and Mouse States
        private KeyboardState kbState;
        private KeyboardState prevKbState;
        private MouseState mouseState;
        private MouseState prevMouseState;

        //textures
        private Texture2D menuScreen;
        private Texture2D gameOverScreen;
        private Texture2D winScreen;
        private Texture2D astronaut;
        private Texture2D hitboxBar;
        private Texture2D pipeSprite;
        private Texture2D sparkSprite;

        //goalpost data
        private Texture2D goal;
        private Vector2 goalLocation;

        //platform textures
        private static Texture2D solidSprite;
        private static Texture2D semiSolidSprite;
        private static Texture2D fallingSheet;

        //Background data
        private Texture2D background;
        private Vector2 backgroundLoc;

        //testing font
        private SpriteFont SpriteFontText;

        //astronaut
        private Player astro;

        //hazards
        private Hazard rock1;
        private Hazard pipe1;
        private Hazard pipe2;
        private Spark spark1;
        private List<Vector2> hazardLocs;
        private List<int> hazardSpeed;
        private int hazardNum;
        private int hazardSpeedNum;
        private float _rotation1;
        private float _rotation2;

        private List<Platform> platforms;
        private bool isGrounded;
        private int collisionNum;
        private int screen;
        private int screenHeight;
        private int number;
        private List<Vector2> bTaps;
        private int fallTimer;
        private int platformfallTimer;

        //god mode bool
        private static bool godMode;

        /// <summary>
        /// Whether the player is in God mode.
        /// God mode makes the player invincible to hazards and gives the player an infinite boost meter.
        /// </summary>
        public static bool GodMode
        {
            get { return godMode; }
        }

        /// <summary>
        /// Enumeration for the game's state.
        /// The game will only update and draw certain objects according to its state.
        /// </summary>
        public enum GameState
        {
            Menu,
            Controls,
            Game,
            Pause,
            Loss,
            Win,
        }
        public static GameState currentState;

        //Button related variables
        private Button[] menuButtons;
        private Button[] gameOverButtons;
        private Button[] winButtons;
        private Button checkBox;
        private Vector2 buttonOffset;

        public Game1()
        {
            _graphics = new GraphicsDeviceManager(this);
            Content.RootDirectory = "Content";
            IsMouseVisible = true;
        }

        protected override void Initialize()
        {
            //Keyboard states
            prevKbState = Keyboard.GetState();
            prevMouseState = Mouse.GetState();

            //testing font
            SpriteFontText = Content.Load<SpriteFont>("arialFont");

            //Set up game logic
            screen = 1;
            number = 0;
            currentState = GameState.Menu;
            fallTimer = 0;
            platformfallTimer = 0;
            buttonOffset = new(129, 426);
            hazardSpeedNum = 0;
            hazardNum = 0;
            godMode = false;
            _rotation1 = 8f;
            _rotation2 = 4f;
            screenHeight = 384;

            //Button lists
            menuButtons = new Button[3];
            gameOverButtons = new Button[3];
            winButtons = new Button[3];

            base.Initialize();
        }

        protected override void LoadContent()
        {
            //Window size is dependent on menu image size
            _graphics.PreferredBackBufferWidth = 768;
            _graphics.PreferredBackBufferHeight = 768;
            _graphics.ApplyChanges();

            //window height and width
            windowWidth = GraphicsDevice.Viewport.Width;
            windowHeight = GraphicsDevice.Viewport.Height;

            _spriteBatch = new SpriteBatch(GraphicsDevice);

            //Loading textures
            astronaut = Content.Load<Texture2D>("astronaut_sheet");
            menuScreen = Content.Load<Texture2D>("no_button_menu");
            gameOverScreen = Content.Load<Texture2D>("no_button_gameOver");
            winScreen = Content.Load<Texture2D>("no_button_gameWon");
            hitboxBar = Content.Load<Texture2D>("hitboxBar");
            pipeSprite = Content.Load<Texture2D>("straightPipe");
            sparkSprite = Content.Load<Texture2D>("spark");
            goal = Content.Load<Texture2D>("goalMachine");

            //Platform textures
            solidSprite = Content.Load<Texture2D>("platform/solidSprite");
            semiSolidSprite = Content.Load<Texture2D>("platform/semiSolidSprite");
            fallingSheet = Content.Load<Texture2D>("platform/fallingSheet");

            //Loading background
            background = Content.Load<Texture2D>("No_signal_background");
            backgroundLoc = new Vector2(0, 0 - windowHeight * 11);

            //loading buttons
            //play button
            menuButtons[0] = new Button(
                Content.Load<Texture2D>("buttons/play"),
                Content.Load<Texture2D>("buttons/play_highlighted"),
                Content.Load<Texture2D>("buttons/play_pressed"),
                buttonOffset, 
                false);

            //options button
            menuButtons[1] = new Button(
                Content.Load<Texture2D>("buttons/options"),
                Content.Load<Texture2D>("buttons/options_highlighted"),
                Content.Load<Texture2D>("buttons/options_pressed"),
                new Vector2(buttonOffset.X, buttonOffset.Y + menuButtons[0].Height), 
                false);

            //quit button
            menuButtons[2] = new Button(
                Content.Load<Texture2D>("buttons/quit"),
                Content.Load<Texture2D>("buttons/quit_highlighted"),
                Content.Load<Texture2D>("buttons/quit_pressed"),
                new Vector2(buttonOffset.X, buttonOffset.Y + menuButtons[0].Height + menuButtons[1].Height),
                false);

            //stats button (game over screen)
            gameOverButtons[0] = new Button(
                Content.Load<Texture2D>("buttons/stats"),                                    // Default
                Content.Load<Texture2D>("buttons/stats_highlighted"),                        // Highlighted
                Content.Load<Texture2D>("buttons/stats_pressed"),                            // Pressed
                buttonOffset, 
                false);

            //reset button (game over screen)
            gameOverButtons[1] = new Button(
                Content.Load<Texture2D>("buttons/reset"),
                Content.Load<Texture2D>("buttons/reset_highlighted"),
                Content.Load<Texture2D>("buttons/reset_pressed"),
                new Vector2(buttonOffset.X, buttonOffset.Y + gameOverButtons[0].Height), 
                false);

            gameOverButtons[2] = new Button(
                Content.Load<Texture2D>("buttons/quit_gameover"),
                Content.Load<Texture2D>("buttons/quit"),
                Content.Load<Texture2D>("buttons/quit_gameover_pressed"),
                new Vector2(buttonOffset.X, buttonOffset.Y + gameOverButtons[0].Height + gameOverButtons[1].Height), 
                false);

            //stats button (game over screen)
            winButtons[0] = new Button(
                Content.Load<Texture2D>("buttons/stats_gamewon"),                                    // Default
                Content.Load<Texture2D>("buttons/stats_gamewon_highlighted"),                        // Highlighted
                Content.Load<Texture2D>("buttons/stats_gamewon_pressed"),                            // Pressed
                buttonOffset, 
                false);

            //reset button (game over screen)
            winButtons[1] = new Button(
                Content.Load<Texture2D>("buttons/reset_gamewon"),
                Content.Load<Texture2D>("buttons/reset_gamewon_highlighted"),
                Content.Load<Texture2D>("buttons/reset_gamewon_pressed"),
                new Vector2(buttonOffset.X, buttonOffset.Y + winButtons[0].Height), 
                false);

            winButtons[2] = new Button(
                Content.Load<Texture2D>("buttons/quit_highlighted"),
                Content.Load<Texture2D>("buttons/quit_gamewon_highlighted"),
                Content.Load<Texture2D>("buttons/quit_gamewon_pressed"),
                new Vector2(buttonOffset.X, buttonOffset.Y + winButtons[0].Height + winButtons[1].Height), 
                false);

            //Checkbox
            checkBox = new Button(
                Content.Load<Texture2D>("checkbox"),
                Content.Load<Texture2D>("checkbox_highlighted"),
                Content.Load<Texture2D>("checkbox_checked"),
                new Vector2(270, 510),
                true);

            //player object
            astro = new Player(windowHeight, windowWidth, astronaut, new Rectangle(384, 384, 50, 100),false);

            hazardLocs = LoadHazardLoc();
            hazardSpeed = LoadHazardSpeed();
            

            pipe1 = new Pipe(hazardSpeed[hazardSpeedNum], hazardSpeed[hazardSpeedNum+1], 
                pipeSprite, 
                new Rectangle((int)hazardLocs[hazardNum].X, (int)hazardLocs[hazardNum].Y, 100, 20), _rotation1,
                false, "pipe");

            pipe2 = new Pipe(hazardSpeed[hazardSpeedNum+2], hazardSpeed[hazardSpeedNum + 3], 
                pipeSprite, 
                new Rectangle((int)hazardLocs[hazardNum+1].X, (int)hazardLocs[hazardNum+1].Y, 100, 20), _rotation2,
                false, "pipe");

            rock1 = new Hazard(hazardSpeed[hazardSpeedNum+4], hazardSpeed[hazardSpeedNum + 5],
                Content.Load<Texture2D>("rockText"), 
                new Rectangle((int)hazardLocs[hazardNum + 2].X, (int)hazardLocs[hazardNum + 2].Y, 200, 200),
                false, "rock");
            
            bTaps = new List<Vector2>
            {
                new Vector2(22, 43),
                new Vector2(82, 43),
                new Vector2(142, 43)
            };

            platforms = LoadPlatforms();
            goalLocation = new Vector2(580, -7795);

            //Initialize static classes
            TextBox.Initialize(Content.Load<Texture2D>("Text_box"), Content.Load<SpriteFont>("uiFont"));
            BoostBar.Initialize(new Vector2(20, 20),
                Content.Load<Texture2D>("boostBar/background"),
                Content.Load<Texture2D>("boostBar/barEmpty"),
                Content.Load<Texture2D>("boostBar/barFull"),
                Content.Load<Texture2D>("boostBar/lightOff"),
                Content.Load<Texture2D>("boostBar/lightOn"));

            //Creates the spark on the 2nd platform of each stage
            if (screen >= 4)
            {
                spark1 = new Spark(0, 0, sparkSprite, new Rectangle(0, 0, 30, 30), false, "spark", platforms[2]);
            }
        }

        protected override void Update(GameTime gameTime)
        {
            if (GamePad.GetState(PlayerIndex.One).Buttons.Back == ButtonState.Pressed || Keyboard.GetState().IsKeyDown(Keys.Escape))
                Exit();
            Random rnd = new Random();
            //Obtain input states pre-emptively
            kbState = Keyboard.GetState();
            mouseState = Mouse.GetState();
           
            Vector2 bgLoc = backgroundLoc;
            TextBox.Update(kbState, prevKbState);
            switch (currentState)
            {
                case GameState.Menu:
                    Reset();
                    Vector2 bg = new Vector2(0, 0 - windowHeight * 11);
                    bgLoc = bg;

                    if (!TextBox.IsActive)
                    {
                        foreach (Button button in menuButtons)
                        {
                            button.Update(mouseState, prevMouseState);
                        }
                        if (menuButtons[0].Clicked(mouseState, prevMouseState))     //If this is clicked
                        {
                            currentState = GameState.Controls;                          //Do whatever it does
                        }
                        if (menuButtons[1].Clicked(mouseState, prevMouseState))
                        {
                            TextBox.Activate();
                        }
                        if (menuButtons[2].Clicked(mouseState, prevMouseState))
                        {
                            Exit();
                        }
                    }

                    // Text box related activity
                    if (IsActive)   
                    {
                        checkBox.Update(mouseState, prevMouseState);
                        if (checkBox.Clicked(mouseState, prevMouseState))
                        {
                            if (!godMode)
                            {   //Set this to true if it's false
                                godMode = true;
                            }
                            else
                            {   //Set this to false if it's true
                                godMode = false;
                            }
                        }
                    }
                    break;
                case GameState.Controls:
                    if (SingleKeyPress(Keys.Enter, kbState, prevKbState))
                    {
                        currentState = GameState.Game;
                    }
                    break;

                case GameState.Game:
                   
                        bgLoc.Y -= astro.Speed;
                        screenHeight -= astro.Speed;
                        for (int i = 0; i < platforms.Count; i++)
                        {
                            platforms[i].Y -= astro.Speed;
                            platforms[i].hitbox.Y -= astro.Speed;

                        }
                        rock1.Y -= astro.Speed;
                    pipe1.Y -= astro.Speed;
                    pipe2.Y -= astro.Speed;
                    goalLocation.Y -= astro.Speed;
                    
                     Rectangle loc = astro.Feet;
                    if (astro.State == PlayerState.StandRight || astro.State == PlayerState.AerialRight || astro.State == PlayerState.BoostRight || astro.State == PlayerState.WalkRight)
                    {
                        loc.X = astro.X + 9;
                    }
                    else
                    {
                        loc.X = astro.X;
                    }
                    loc.Y = astro.Y + 100;
                    astro.Feet = loc;
                    astro.Update(gameTime);
                    rock1.Update(gameTime);
                    pipe1.Update(gameTime);
                    pipe2.Update(gameTime);
                    BoostBar.Update(astro);
                    if (screen >= 4)
                    {
                        spark1.Update(gameTime);
                    }
                    if ((rock1.CheckCollision(astro) || pipe1.CheckCollision(astro) || pipe2.CheckCollision(astro))
                        && !godMode)
                    {

                        currentState = GameState.Loss;
                    }
                    if (screen >= 4 && spark1.CheckCollision(astro) && !godMode)
                    {
                        currentState = GameState.Loss;
                    }
                   if(kbState.IsKeyDown(Keys.K)) { currentState = GameState.Win; }


                    if (SingleKeyPress(Keys.Enter, kbState, prevKbState))
                    {
                        currentState = GameState.Pause;
                    }

                
                    //if astro is in the air
                    if (!isGrounded)
                    {
                        for (int i = 0; i < platforms.Count; i++)
                        {
                            if (platforms[i].Type == PlatformType.SemiSolid || platforms[i].Type == PlatformType.Falling)
                            {
                                isGrounded = platforms[i].CheckCollision(astro); //checks if there is a collision
                                if (isGrounded == true) //if there is a collision
                                {
                                    astro.IsGrounded = true; //sets the astro to gorunded
                                    collisionNum = i; // stores number collided with
                                    break;
                                }
                                astro.IsGrounded = false;
                            }
                            if (platforms[i].Type == PlatformType.Solid)
                            {
                                if (platforms[i].SolidCollision(astro) == "true")
                                {
                                    isGrounded = true;
                                    astro.IsGrounded = true;
                                    collisionNum = i;   
                                    break;
                                }
                                 if(platforms[i].SolidCollision(astro) == "bottom" && astro.Speed <0 )
                                {
                                    astro.Speed = 0;
                                }

                                astro.IsGrounded = false;
                            }
                        }
                    }
                    if (isGrounded)
                    {
                        
                        if (collisionNum == 30 && astro.X > 550 && kbState.IsKeyDown(Keys.W))
                        {
                                currentState = GameState.Win;
                        }
                        
                        isGrounded = platforms[collisionNum].CheckCollision(astro);
                        astro.IsGrounded = true;
                        platformfallTimer = collisionNum;
                    }
                    if (platforms[platformfallTimer].Type == PlatformType.Falling)
                    {
                        platforms[platformfallTimer].UpdateAnimation(gameTime);
                        fallTimer++;
                        if (fallTimer > 60)
                        {
                            platforms[platformfallTimer].hitbox.X += 1000;
                            platforms[platformfallTimer].X = 1000;
                            fallTimer=0;    
                            
                            
                        }
                        
                    }

                    //screen incrementation
                    
                    number = 0;
                    if (screenHeight > 786)
                    {
                        screenHeight = 0;
                        number = 1;
                    }
                    //if player goes through top of screen
                    if (number == 1)
                    {
                        fallTimer = 0;
                        screen++;

                        
                            hazardNum += 3;
                        
                     
                        if (screen >= 4 && screen < 8)
                        {
                           spark1 = new Spark(0, 0, sparkSprite, new Rectangle(0, 0, 30, 30), false, "spark", platforms[(screen * 3) - 1]);
                           spark1.Y -= astro.Speed;
                        }

                    }
                    if(screenHeight < 0)
                    {
                        screenHeight = 768;
                        screen--;
                        if (screen > 0)
                        {
                            hazardNum -= 3;
                        }
                    }

                    if (screen >= 4)
                    {
                       spark1.Y -= astro.Speed;

                    }
                    if (screen < 11)
                    {
                        //hazards respawn
                        if (rock1.Y > windowHeight + 200)
                        {
                            rock1.Y = (int)hazardLocs[hazardNum + 2].Y;
                            rock1.X = (int)hazardLocs[hazardNum + 2].X;
                        }
                        if (pipe1.Y > windowHeight + 200)
                        {
                            pipe1.Y = (int)hazardLocs[hazardNum].Y;
                            pipe1.X = (int)hazardLocs[hazardNum].X;
                        }
                        if (pipe2.Y > windowHeight + 200)
                        {
                            pipe2.Y = (int)hazardLocs[hazardNum + 1].Y;
                            pipe2.X = (int)hazardLocs[hazardNum + 1].X;
                        }
                    }
                    break;

                case GameState.Pause:
                    if (SingleKeyPress(Keys.Back, kbState, prevKbState))
                    {
                        currentState = GameState.Game;
                    }
                    else if (SingleKeyPress(Keys.Enter, kbState, prevKbState))
                    {
                        currentState = GameState.Menu;
                    }
                    break;

                case GameState.Win:
                    if (!TextBox.IsActive)
                    {
                        foreach (Button button in winButtons)
                        {
                            button.Update(mouseState, prevMouseState);
                        }
                        if (winButtons[0].Clicked(mouseState, prevMouseState))
                        {
                            TextBox.Activate();
                        }
                        if (winButtons[1].Clicked(mouseState, prevMouseState))
                        {
                            currentState = GameState.Menu;
                        }
                        if (winButtons[2].Clicked(mouseState, prevMouseState))
                        {
                            Exit();
                        }
                    }
                    
                    break;
                case GameState.Loss:
                    if (!TextBox.IsActive)
                    {
                        foreach (Button button in gameOverButtons)
                        {
                            button.Update(mouseState, prevMouseState);
                        }
                        if (gameOverButtons[0].Clicked(mouseState, prevMouseState))
                        {
                            TextBox.Activate();
                        }
                        if (gameOverButtons[1].Clicked(mouseState, prevMouseState))
                        {
                            currentState = GameState.Menu;
                        }
                        if (gameOverButtons[2].Clicked(mouseState, prevMouseState))
                        {
                            Exit();
                        }
                    }
                    break;
            }
            
            prevKbState = kbState;
            prevMouseState = mouseState;
            backgroundLoc = bgLoc;
            base.Update(gameTime);
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(Color.DarkViolet);

            _spriteBatch.Begin();
            switch (currentState)
            {
                case GameState.Menu:
                    //Draw the menu screen and buttons in the right positions.
                    _spriteBatch.Draw(menuScreen, new Vector2(0, 0), Color.White);
                    foreach (Button button in menuButtons)
                    {
                        button.Draw(_spriteBatch);
                    }
                    if (TextBox.IsActive)
                    {
                        TextBox.Draw(_spriteBatch, "OPTIONS\n\nGod Mode: ", 15);
                        checkBox.Draw(_spriteBatch);
                    }
                    break;

                case GameState.Controls:
                    _spriteBatch.Draw(menuScreen, Vector2.Zero, Color.White);
                    TextBox.Draw(_spriteBatch, "GOAL\n\nGet to the top!\n\nCONTROLS\n\nA and D: Move left and right\nSpace: Jump\nSpace (midair): Boost\nOnly 3 boosts permitted per jump\nHit ENTER to pause at any time\nHit W at the goal to win", 32);
                    break;

                case GameState.Game:
                    //Draw background first
                    _spriteBatch.Draw(background, backgroundLoc, Color.White);

                    // player and hazards
                    astro.Draw(_spriteBatch, Color.White);
                    rock1.Draw(_spriteBatch, Color.White);
                    pipe1.Draw(_spriteBatch, Color.White);
                    pipe2.Draw(_spriteBatch, Color.White);

                    // _spriteBatch.Draw(hitboxBar,pipe1.SquareRect, Color.Blue);
                    if (screen >= 4)
                    {
                        spark1.Draw(_spriteBatch, Color.White);
                    }

                    //displays 3 platforms in platfrom List depending on screen
                    for (int i = 0; i < platforms.Count; i++)
                    {
                        platforms[i].Draw(_spriteBatch, Color.White);
                   

                    }
                    
                    //Draw goalpost
                    _spriteBatch.Draw(goal, goalLocation, Color.White);

                    //Draw the boost bar
                    BoostBar.Draw(_spriteBatch);

                    if (screen == 1)
                    {
                        platforms[0].Draw(_spriteBatch, Color.White);
                    }
                    break;

                case GameState.Pause:
                    _spriteBatch.Draw(menuScreen, Vector2.Zero, Color.White);
                    TextBox.Draw(_spriteBatch, "PAUSED\n\n\nPress ENTER to return to menu", 15);
                    break;

                case GameState.Win:
                    //Draw the win screen and buttons in the right positions.
                    _spriteBatch.Draw(winScreen, new Vector2(0, 0), Color.White);
                    foreach (Button button in winButtons)
                    {
                        button.Draw(_spriteBatch);
                    }
                    if (TextBox.IsActive)
                    {
                        TextBox.Draw(_spriteBatch, "STATS\n\nScreen reached: " + screen, 20);
                    }
                    break;

                case GameState.Loss:
                    //Draw the game over screen and buttons in the right positions.
                    _spriteBatch.Draw(gameOverScreen, new Vector2(0, 0), Color.White);
                    foreach (Button button in gameOverButtons)
                    {
                        button.Draw(_spriteBatch);
                    }
                    if (TextBox.IsActive)
                    {
                        TextBox.Draw(_spriteBatch, "STATS\n\nScreen reached: " + screen, 20);
                    }
                    break;
            }
            _spriteBatch.End();
            base.Draw(gameTime);
        }

        #region HelperMethods

        /// <summary>
        /// Simplified form of reading key presses.
        /// </summary>
        /// <param name="key">The key being pressed.</param>
        /// <param name="kbState">The current keyboard state.</param>
        /// <param name="prevKeyboard">The previous keyboard state.</param>
        /// <returns>Whether the key was just pressed.</returns>
        public static bool SingleKeyPress(Keys key, KeyboardState kbState, KeyboardState prevKeyboard)
        {
            return kbState.IsKeyDown(key) && prevKeyboard.IsKeyUp(key);
        }

        /// <summary>
        /// Simplified form of reading mouse clicks.
        /// </summary>
        /// <param name="mouseState">The current mouse state.</param>
        /// <param name="prevMouseState">The previous mouse state.</param>
        /// <returns>Whether the mouse was just released after a click.</returns>
        public static bool SingleMouseClick(MouseState mouseState, MouseState prevMouseState)
        {
            return mouseState.LeftButton == ButtonState.Released && prevMouseState.LeftButton == ButtonState.Pressed;
        }

        /// <summary>
        /// Loads platforms from a file containing position data and solidity.
        /// </summary>
        /// <returns>A list of all the platforms.</returns>
        private static List<Platform> LoadPlatforms()
        {
            Texture2D texture;
            PlatformType type;
            StreamReader reader = null;
            List<Platform> result = new List<Platform>();
            string line;
            string[] data;
            int[] numbers = new int[3];
            try
            {
                reader = new StreamReader("../../../level-layout.txt");
                reader.ReadLine();
                while ((line = reader.ReadLine()) != null)
                {
                    data = line.Split(";");
                    for (int i = 0; i < data.Length - 1; i++)
                    {
                        numbers[i] = int.Parse(data[i]);
                    }
                    type = Enum.Parse<PlatformType>(data[3]);
                    switch (type)
                    {
                        case PlatformType.Solid:
                            texture = solidSprite;
                            break;
                        case PlatformType.SemiSolid:
                            texture = semiSolidSprite;
                            break;
                        case PlatformType.Falling:
                            texture = fallingSheet;
                            break;
                        default:
                            texture = solidSprite;
                            break;
                    }
                    result.Add(new Platform(texture,
                        new Rectangle(numbers[0], numbers[1], numbers[2], 30),
                        true,
                        Enum.Parse<PlatformType>(data[3])));
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine(e.Message);
            }
            if (reader != null)
            {
                reader.Close();
            }
            return result;
        }

        /// <summary>
        /// Loads the locations of the hazards from a text file.
        /// </summary>
        /// <returns>A list of the locations of the hazards.</returns>
        private static List<Vector2> LoadHazardLoc()
        {
            List<Vector2> result = new List<Vector2>();
            StreamReader reader = null;
            string line;
            string[] data;
            int[] numbers = new int[4];
            try
            {
                reader = new StreamReader("../../../hazards.txt");
                reader.ReadLine();
                while ((line = reader.ReadLine()) != null)
                {
                    data = line.Split(";");
                    for (int i = 0; i < data.Length; i++)
                    {
                        numbers[i] = int.Parse(data[i]);
                    }
                    result.Add(new Vector2(numbers[0], numbers[1]));
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine(e.Message);
            }
            if (reader != null)
            {
                reader.Close();
            }

            return result;
        }

        /// <summary>
        /// Loads the speeds of the hazards from a text file.
        /// </summary>
        /// <returns>A list of the speeds of the hazards.</returns>
        private static List<int> LoadHazardSpeed()
        {
            List<int> result = new List<int>();
            StreamReader reader = null;
            string line;
            string[] data;
            int[] numbers = new int[4];
            try
            {
                reader = new StreamReader("../../../hazards.txt");
                reader.ReadLine();
                while ((line = reader.ReadLine()) != null)
                {
                    data = line.Split(";");
                    for (int i = 0; i < data.Length; i++)
                    {
                        numbers[i] = int.Parse(data[i]);
                    }
                    result.Add(numbers[2]);
                    result.Add(numbers[3]);
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine(e.Message);
            }
            if (reader != null)
            {
                reader.Close();
            }

            return result;
        }

        /// <summary>
        /// Resets all the game data.
        /// </summary>
        private void Reset()
        {
            //rests all counters and locations
            screen = 1;
            number = 0;
            fallTimer = 0;
            platformfallTimer = 0;
            hazardSpeedNum = 0;
            collisionNum = 0;
            hazardNum = 0;
            astro.Y = 384;
            astro.X = 384;
            if (screen >= 4)
            {
                spark1 = new Spark(0, 0, sparkSprite, new Rectangle(0, 0, 30, 30), false, "spark", platforms[2]);
            }


            //clears and reloads platforms
            platforms.Clear();
            platforms = LoadPlatforms();

            pipe1.SpeedX = hazardSpeed[hazardSpeedNum];     //updates the x and y speeds of the hazards from hazardSpeed list, loaded from hazards.txt
            pipe1.SpeedY = hazardSpeed[hazardSpeedNum + 1];
            pipe2.SpeedX = hazardSpeed[hazardSpeedNum + 2];
            pipe2.SpeedY = hazardSpeed[hazardSpeedNum + 3];
            rock1.SpeedX = hazardSpeed[hazardSpeedNum + 4];
            rock1.SpeedY = hazardSpeed[hazardSpeedNum + 5];
            pipe1.Y = (int)hazardLocs[hazardNum].Y;       //updates hazard y location from hazardLocs list, loaded from hazards.txt
            pipe2.Y = (int)hazardLocs[hazardNum + 1].Y;
            rock1.Y = (int)hazardLocs[hazardNum + 2].Y;
            pipe1.X = (int)hazardLocs[hazardNum].X;      //updates hazard x location from hazardLocs list, loaded from hazards.txt
            pipe2.X = (int)hazardLocs[hazardNum + 1].X;
            rock1.X = (int)hazardLocs[hazardNum + 2].X;
        }

        #endregion
    }
}