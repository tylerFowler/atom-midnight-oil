# midnight-oil

Change themes based on the time of day

Installation: `apm install midnight-oil`

# Usage

### Changing Themes
It's highly recommended that you look at the settings and adjust them accordingly after installing. The most important settings are the 'Day Theme' and 'Night Theme' settings, additionally if you use a UI theme (such as Atom Material) that adapts the color scheme to be light or dark depending on the syntax theme, you should turn off the 'Switch Theme' setting. Turning this setting off will retain your UI theme regardless of what options are set and will only change the syntax theme.

### Setting Trigger Times
The 'Day Time' and 'Night Time' settings control the time at which the package triggers a theme transition. These times should be in the format of the hour and the minute separated by a `:` (e.g. `8:30`). The day time is in AM and the night time is in PM however you can also use a 24 hour time format like `20:30` for 8:30 PM. Note that changing these settings does require a restart or a reload.

The package will also use these time settings to detect what time of day it is on Atom startup and switch the theme accordingly.

### Snooze
Because changing the theme can be disruptive while working, when a trigger time is reached a confirmation dialog will appear with an option to switch the theme over or snooze the transition. After snoozing the dialog will simply appear again after 5 minutes.

### Known Issues
After switching from a dark to a light theme or vice versa there seems to be an issue where Atom will keep some elements from the previous theme (i.e. the active pane keeping the old syntax coloring with the new theme or textboxes using the dark theme against a light background). Usually this can simply be fixed by either restarting or reloading Atom. Annoying but hopefully this gets fixed soon, see issue [#9550](https://github.com/atom/atom/issues/9550) on Atom for more details.

# TODO

- [ ] Occasionally the package adds between ~450ms - ~500ms to the Atom startup time but typically only ads ~5ms - ~8ms. Work on profiling the main `activate()` function and see where time is being spent in those cases.
- [ ] Write tests for the functions that parse time & switch themes
- [ ] Write tests for the TimeEmitter class
