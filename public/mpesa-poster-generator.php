<?php
/**
 * Plugin Name: M-Pesa Poster Generator
 * Description: A professional M-Pesa payment poster generator for businesses.
 * Version: 1.0.0
 * Author: Martin Mbuco
 */

if (!defined('ABSPATH')) exit;

function mpesa_poster_shortcode() {
    // Find the JS and CSS files in the assets folder
    $plugin_url = plugin_dir_url(__FILE__);
    $plugin_path = plugin_dir_path(__FILE__);
    
    $js_file = '';
    $css_file = '';
    
    // Scan assets directory for the built files
    if (is_dir($plugin_path . 'assets')) {
        $files = scandir($plugin_path . 'assets');
        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'js') {
                $js_file = 'assets/' . $file;
            }
            if (pathinfo($file, PATHINFO_EXTENSION) === 'css') {
                $css_file = 'assets/' . $file;
            }
        }
    }

    // Enqueue the styles and scripts
    if ($css_file) {
        wp_enqueue_style('mpesa-poster-styles', $plugin_url . $css_file, array(), '1.0.0');
    }
    
    // Output the root div and the script
    ob_start();
    ?>
    <div id="root"></div>
    <script type="module">
        import { mount } from '<?php echo $plugin_url . $js_file; ?>';
    </script>
    <script type="module" src="<?php echo $plugin_url . $js_file; ?>"></script>
    <?php
    return ob_get_clean();
}

add_shortcode('mpesa_poster_generator', 'mpesa_poster_shortcode');
