# Visuo-Perceptive images

Drop image files here using the convention:

    <sous_test>_<numero>.jpg

Recognised `sous_test` values:

- discrimination
- memoire_visuelle
- memoire_sequentielle
- memoire_perceptive
- cloture
- constance_forme
- figure_fond
- intrus
- fond_cache

Examples: `discrimination_1.jpg`, `memoire_sequentielle_12.jpg`.

For memoire_sequentielle and memoire_perceptive the odd-numbered file is the
stimulus (shown 3 s) and the following even-numbered file is the choice screen.

Files are served directly at `/images/visuo-perceptive/<filename>`. If a file
with the same name is uploaded via the admin UI it is kept in `localStorage`
and takes precedence over the on-disk version.
