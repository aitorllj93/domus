DATE=$(date +"%Y-%m-%d")
BOOK_DIR="/DATA/Media/Books"
REMOTE_BACKUP_DIR="Drive:Shared/BackUps"
BOOK_FILE="books_$DATE.tar.gz"

echo "Backing up $BOOK_DIR to $REMOTE_BACKUP_DIR/$BOOK_FILE"
tar -czvf $BOOK_FILE $BOOK_DIR
rclone copy $BOOK_FILE $REMOTE_BACKUP_DIR -vv