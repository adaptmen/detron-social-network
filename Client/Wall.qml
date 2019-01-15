import QtQuick 2.9

Item {

	id: root
	
	property var owner_info: ({});
	property var posts: ([]);
	
	function addPost(innerString) {
		var innerObject = Qt.createQmlObject(innerString, postsView, 'newObject');
        postModel.append({ innerObject: innerObject });
	}
	
	Component.onCompleted {
		parsePosts();
	}
	
	function parsePosts() {
		for (var i = 0; i < posts.length; i++) {
			var postString = "import QtQuick 2.5;
				Rectangle {
					Rectangle {
						id: maker_avatar
						Image {
							source: maker_avatar_link
						}
					}
					Text {
						id: maker_name
						text: maker_name
						MouseArea {
							anchors.fill: parent
							onClicked: goToPage(maker_id)
						}
					}
					Text {
						id: time
						text: time
					}
					Text {
						id: content
						text: content
					}
					Text {
						id: likes
						color: isLiked ? "blue" : "#737373"
						text: " + Number(likes_count) + "
						MouseArea {
							anchors.fill: parent
							onClicked: {
								toggleLike(" + post_id + ", function() {
									isLiked = !isLiked;
								});
							}
						}
					}
					Text {
						id: reposts
						text: reposts_count
					}
					Text {
						id: comments
						text: comments_count
					}
					Text {
						id: watches
						text: watches_count
					}
				}";
				addPost(postString);
			}
	}
	
	Rectangle {
		id: avatar
		Image {
			source: owner_info['avatar_link']
		}
	}
	
	Text {
		id: owner_name
		text: owner_info['name']
	}
	
	Text {
		id: owner_status
		text: owner_info['status']
		visible: !!(owner_info['status'])
	}
	
	Text {
		text: "Friends"
		Text {
			id: friends
			text: owner_info['friends_count']
		}
	}
	
	Text {
		text: "Subscribers"
		Text {
			id: subscribers
			text: owner_info['subscribers_count']
		}
	}
	
	Scrollabale {
		ListView {
			id: postsView
			model: postModel
			delegate: Item {
				width: root.width
				height: root.height
				z: parent.z + 1
				Rectangle {
					color: "#ffffff"
					anchors.fill: parent
					ColumnLayout {
						id: pageLayout
						width: parent.width
						height: parent.height
						anchors.centerIn: parent
						anchors.fill: parent
						children: innerObject
						Component.onCompleted: {
							pageLayout.children[0].anchors.fill = pageLayout.children[0].parent;
						}
					}
				}
			}
		}
	}
	
	ListModel {
		id: postModel
	}

}