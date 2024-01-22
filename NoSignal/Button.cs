using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NoSignal
{
    /// <summary>
    /// The UI state of the buttons. 
    /// Buttons can be highlighted or pressed, and have a default appearance otherwise.
    /// </summary>
    public enum UIState
    {
        Normal,
        Highlighted,
        Pressed,
    }

    /// <summary>
    /// Button class.
    /// Buttons are clickable UI elements that 
    /// </summary>
    internal class Button
    {
        //Sprites
        private Texture2D normal;
        private Texture2D highlighted;
        private Texture2D pressed;

        //misc necessities
        private Vector2 position;
        private UIState state;
        
        //Checkbox related variables
        bool checkBox;
        bool isChecked;

        //Public position integers
        public int Width
        {
            get { return normal.Width; }
        }
        public int Height
        {
            get { return normal.Height; }
        }
        public UIState State
        {
            get { return state; }
            set { state = value; }
        }

        /// <summary>
        /// Main constructor, simply needing the textures and position.
        /// </summary>
        /// <param name="normal">The default button sprite.</param>
        /// <param name="highlighted">The highlighted button sprite.</param>
        /// <param name="pressed">The pressed button sprite.</param>
        /// <param name="position">The location of the button on the screen.</param>
        public Button(Texture2D normal, Texture2D highlighted, Texture2D pressed, Vector2 position, bool checkBox)
        {
            this.normal = normal;
            this.highlighted = highlighted;
            this.pressed = pressed;
            this.position = position;
            state = UIState.Normal;
            this.checkBox = checkBox;
            isChecked = false;
        }

        /// <summary>
        /// Changes the button's state based on the mouse's actions
        /// </summary>
        /// <param name="state">The mouse's current state.</param>
        /// <param name="prevState">The mouse's previous state.</param>
        public void Update(MouseState state, MouseState prevState)
        {
            //If the mouse hovers over the button
            if (Hover(state))
            {
                //If the button is not a checked box
                if (!isChecked)
                {
                    this.state = UIState.Highlighted;               //Highlight the button
                }
                //While the mouse is held on the button
                if (state.LeftButton == ButtonState.Pressed)        
                {
                    this.state = UIState.Pressed;               //The button will appear pressed
                }
                //If the button is a checkbox
                if (checkBox)
                {
                    //If this checkbox is clicked
                    if (Clicked(state, prevState))
                    {
                        //Turn the check on and off
                        if (!isChecked)
                        {
                            isChecked = true;
                            //The checkbox always appears checked in this state.
                            this.state = UIState.Pressed;
                        }
                        else
                        {
                            isChecked = false;
                        }
                    }
                }
            }
            else
            {
                if (isChecked)
                {
                    //The pressed state acts as the checked state for checkboxes
                    this.state = UIState.Pressed;           
                }
                else
                {
                    this.state = UIState.Normal;            //The button is in the default state
                }
            }
        }

        /// <summary>
        /// Checks whether the button is clicked.
        /// </summary>
        /// <param name="state">The mouse's current state.</param>
        /// <param name="prevState">The mouse's previous state.</param>
        /// <returns>Whether the button was clicked.</returns>
        public bool Clicked(MouseState state, MouseState prevState)
        {
            //The mouse must click while hovering over the button for this to be true
            return Hover(state) && Game1.SingleMouseClick(state, prevState);
        }

        /// <summary>
        /// Draws the button in the appopriate state.
        /// </summary>
        /// <param name="sb">The sprite batch to draw on.</param>
        public void Draw(SpriteBatch sb)
        {
            //Draw a different sprite depending on the state
            switch (state)
            {
                case UIState.Normal:
                    sb.Draw(normal, position, Color.White);
                    break;
                case UIState.Highlighted:
                    sb.Draw(highlighted, position, Color.White);
                    break;
                case UIState.Pressed:
                    sb.Draw(pressed, position, Color.White);
                    break;
            }
        }
        /// <summary>
        /// Tracks whether the mouse hovers over the buttons in the menu.
        /// </summary>
        /// <param name="state">The mouse state to be read.</param>
        /// <returns>True if the mouse hovers over the specified button.</returns>
        public bool Hover(MouseState state)
        {
            //Obtain the mouse's position
            Vector2 mousePos = state.Position.ToVector2();

            //If the mouse's X position is within the button's sprite (using the position and width), call the Y equivalent
            if (mousePos.X > position.X && mousePos.X < position.X + Width)
            {
                //Y equivalent decides what is returned.
                return mousePos.Y > position.Y && mousePos.Y < position.Y + Height;
            }

            //return false if the condition above isn't met.
            return false;
        }
    }
}
