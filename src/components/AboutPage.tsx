import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-lvnBg py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <img 
            src="/Leaven Logo.png" 
            alt="LVN Clothing" 
            className="w-32 h-32 mx-auto mb-8 object-contain"
          />
          <h1 className="text-5xl font-bold text-lvn-black mb-6">
            About Leaven Clothing
          </h1>
          <p className="text-xl text-lvn-black/70 max-w-3xl mx-auto leading-relaxed">
            Leaven Clothing — also known as LVN — is more than apparel. Our mission is to provide 
            excellent clothing while exercising the gifts God has given us for His glory.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-lvn-white p-8 rounded-none shadow-sm mb-12">
          <h2 className="text-3xl font-bold text-lvn-black mb-6">Our Mission</h2>
          <div className="prose prose-lg max-w-none text-lvn-black/80 leading-relaxed space-y-4">
            <p>
              Every piece we design carries a Kingdom mindset: proclaiming that Christ is victorious 
              over sin and death, and that He is even now putting all of His enemies under His feet 
              (Psalm 110:1), until He returns to destroy the final enemy, death (1 Corinthians 15:20–26).
            </p>
            <p>
              Through clothing, we seek to herald that Kingdom, pointing to the unstoppable growth 
              of Christ's reign on Earth.
            </p>
          </div>
        </div>

        {/* Our Name Section */}
        <div className="bg-lvn-white p-8 rounded-none shadow-sm mb-12">
          <h2 className="text-3xl font-bold text-lvn-black mb-6">Our Name: Leaven (Matthew 13:33)</h2>
          <div className="prose prose-lg max-w-none text-lvn-black/80 leading-relaxed">
            <p>
              In the Gospels, Jesus describes the Kingdom of Heaven as leaven — yeast hidden in dough 
              until the whole lump is transformed. Just as leaven spreads slowly but irresistibly, 
              so Christ's Kingdom expands until it permeates every corner of creation.
            </p>
            <p>
              Through clothing, we seek to herald that Kingdom, pointing to the unstoppable growth 
              of Christ's reign on Earth.
            </p>
          </div>
        </div>

        {/* Our Faith Section */}
        <div className="bg-lvn-white p-8 rounded-none shadow-sm mb-12">
          <h2 className="text-3xl font-bold text-lvn-black mb-6">Our Faith</h2>
          <div className="prose prose-lg max-w-none text-lvn-black/80 leading-relaxed">
            <p className="mb-6">
              We confess the historic Christian faith — apostolic, catholic (small "c"), and orthodox 
              (small "o") — as expressed in the Apostles', Nicene, and Athanasian Creeds. Our foundation 
              is the unchanging Gospel of Jesus Christ:
            </p>
            
            <div className="space-y-4 ml-6">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-lvn-maroon rounded-full mt-3 flex-shrink-0"></div>
                <p>
                  Humanity, created in God's image, fell into sin and separation from Him.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-lvn-maroon rounded-full mt-3 flex-shrink-0"></div>
                <p>
                  God promised a Redeemer, fulfilled in Jesus Christ, the Son of God made flesh.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-lvn-maroon rounded-full mt-3 flex-shrink-0"></div>
                <p>
                  Jesus lived the sinless life we have not, bore our sins on the cross, died, and rose 
                  again victorious over sin and death in order that through repentance and faith we can 
                  be forgiven of our sins and be reconciled to God.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-lvn-maroon rounded-full mt-3 flex-shrink-0"></div>
                <p>
                  He ascended to the right hand of the Father, reigning now, building His Church, and 
                  putting all enemies under His feet.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-lvn-maroon rounded-full mt-3 flex-shrink-0"></div>
                <p>
                  He will return to consummate His Kingdom and deal finally with death.
                </p>
              </div>
            </div>
            
            <p className="mt-6 italic text-lvn-maroon">
              This is the good news that we wear, share, and proclaim through Leaven Clothing (Matthew 4:23).
            </p>
          </div>
        </div>

        {/* Great Commission Section */}
        <div className="bg-lvn-white p-8 rounded-none shadow-sm mb-12">
          <h2 className="text-3xl font-bold text-lvn-black mb-6">Our Mission: The Great Commission</h2>
          <div className="prose prose-lg max-w-none text-lvn-black/80 leading-relaxed">
            <blockquote className="border-l-4 border-lvn-maroon pl-6 italic text-lvn-maroon text-xl mb-6">
              "All authority in heaven and on earth has been given to me. Therefore, go and make 
              disciples of all nations..." (Matthew 28:18–20)
            </blockquote>
            <p>
              At Leaven, we see these words as our marching orders. Through our brand we want to 
              inspire believers not only to wear their faith but to share it. Clothing becomes both 
              a personal reminder of Christ's victory and a public testimony to the hope we have in Him.
            </p>
          </div>
        </div>

        {/* Kingdom Focus Section */}
        <div className="bg-lvn-white p-8 rounded-none shadow-sm mb-12">
          <h2 className="text-3xl font-bold text-lvn-black mb-6">Kingdom Focus</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-lvn-maroon/20 rounded-none p-6">
              <h3 className="text-xl font-bold text-lvn-maroon mb-3">Christus Victor</h3>
              <p className="text-lvn-black/80">
                Christ triumphant over sin, death, and the devil.
              </p>
            </div>
            
            <div className="border border-lvn-maroon/20 rounded-none p-6">
              <h3 className="text-xl font-bold text-lvn-maroon mb-3">Cultural Leaven</h3>
              <p className="text-lvn-black/80">
                Faith spreading through every sphere of life.
              </p>
            </div>
            
            <div className="border border-lvn-maroon/20 rounded-none p-6">
              <h3 className="text-xl font-bold text-lvn-maroon mb-3">Faithful Stewardship</h3>
              <p className="text-lvn-black/80">
                Using our gifts and talents for God's glory.
              </p>
            </div>
            
            <div className="border border-lvn-maroon/20 rounded-none p-6">
              <h3 className="text-xl font-bold text-lvn-maroon mb-3">Gospel Witness</h3>
              <p className="text-lvn-black/80">
                Every garment pointing back to the saving work of Christ.
              </p>
            </div>
          </div>
        </div>

        {/* Final Statement */}
        <div className="bg-lvn-maroon text-white p-8 rounded-none shadow-sm text-center">
          <p className="text-2xl font-bold mb-4">
            ⚜️ Leaven Clothing exists to build up the body of Christ, bear witness to the Kingdom, 
            and glorify God through the work of our hands.
          </p>
          <p className="text-lg opacity-90">
            Every piece carries the Gospel message.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;