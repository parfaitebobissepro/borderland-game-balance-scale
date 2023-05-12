MONGODB_URL=$(sed -n 's/^MONGODB_URL=//p' .env)
mongosh "$MONGODB_URL" << EOF
use balance-scale
db.users.deleteMany({})
db.steps.deleteMany({})
db.rooms.deleteMany({})
exit
EOF