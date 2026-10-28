import fs from 'node:fs/promises';
const state='products/.state/store-organization',a=JSON.parse(await fs.readFile(state+'/audit.json'));const raw=a.theme.files.nodes.find(f=>f.filename==='templates/index.json').body.content;const parse=s=>JSON.parse(s.replace(/^\s*\/\*[\s\S]*?\*\//,''));const home=parse(raw);await fs.mkdir(state+'/local-before',{recursive:true});await fs.writeFile(state+'/local-before/index.json',await fs.readFile('templates/index.json'));await fs.writeFile(state+'/local-before/product-recommendations.liquid',await fs.readFile('sections/product-recommendations.liquid'));
if(home.sections.best_sellers?.settings.collection!=='featured')throw Error('Unexpected homepage selection');home.sections.best_sellers.settings.collection='best-sellers';home.sections.featured.settings.collection='featured';home.sections.new.settings.collection='new-arrivals';home.sections.hero.settings.button_link='/collections/new-arrivals';
if(home.sections.look)home.sections.look.disabled=true;
const story=home.sections.story?.settings;if(story){story.story_text=story.story_text.replace('everything we design','the pieces we select');story.signoff_title='Selection and detail';}
const answers={
'inquiries-0':'<p>Compare the dimensions and interior details on the product page with your phone and other essentials. Fit varies by design. Contact us before ordering if you need help checking a specific item.</p>',
'inquiries-1':'<p>Materials and finishes vary by product. Do not assume a bag is waterproof or water resistant. Follow the care guidance provided for the specific material, and contact us if those details are not available.</p>',
'inquiries-2':'<p>Delivery options and estimates depend on the item and destination. Check the shipping information and options shown at checkout, or contact us before ordering. Processing and delivery times can vary.</p>',
'inquiries-3':'<p>Please read our published return policy before ordering for the applicable conditions and return process. Contact us if you need clarification before making a purchase.</p>',
'inquiries-4':'<p>Strap length and adjustability vary by design. Check the selected product’s description and photographs, and contact us if a measurement or adjustment detail is missing.</p>'};
for(const [id,answer]of Object.entries(answers))if(home.sections.inquiries?.blocks[id])home.sections.inquiries.blocks[id].settings.answer=answer;
const original=await fs.readFile(state+'/recommendations-before.liquid','utf8');const schema=original.slice(original.indexOf('{% schema %}'));if(!schema.startsWith('{% schema %}'))throw Error('No recommendation schema');
const recommendation=`{% if product != blank %}
  {% assign recommendation_count = 0 %}
  {% capture recommendation_cards %}
    {% for recommended_product in recommendations.products %}
      {% unless recommended_product.tags contains 'demo' %}
        {% if recommended_product.available and recommended_product.id != product.id %}
          {% assign recommendation_count = recommendation_count | plus: 1 %}
          {% render 'product-card', product: recommended_product, section_id: section.id, card_index: recommendation_count %}
          {% if recommendation_count >= section.settings.limit %}{% break %}{% endif %}
        {% endif %}
      {% endunless %}
    {% endfor %}
  {% endcapture %}
  <section data-product-recommendations data-url="{{ routes.product_recommendations_url }}" data-product-id="{{ product.id }}" data-section-id="{{ section.id }}" data-intent="{{ section.settings.intent }}" data-limit="10" {% if recommendation_count == 0 %}hidden{% endif %}>
    <div data-recommendation-content>
      {% if recommendation_count > 0 %}
        <div class="section-spacing hairline-bottom"><div class="container">
          <h2 class="section-heading">{{ section.settings.heading | escape }}</h2>
          <div class="collection-product-grid" style="--collection-columns: 4;">{{ recommendation_cards }}</div>
        </div></div>
      {% endif %}
    </div>
  </section>
{% endif %}
`+schema;
await fs.mkdir('products/store-organization/theme-update/templates',{recursive:true});await fs.mkdir('products/store-organization/theme-update/sections',{recursive:true});
const content=JSON.stringify(home,null,2)+'\n';for(const file of ['templates/index.json','products/store-organization/theme-update/templates/index.json'])await fs.writeFile(file,content);for(const file of ['sections/product-recommendations.liquid','products/store-organization/theme-update/sections/product-recommendations.liquid'])await fs.writeFile(file,recommendation);
const before=parse(raw);const changes=Object.keys(home.sections).filter(k=>JSON.stringify(home.sections[k])!==JSON.stringify(before.sections[k]));await fs.writeFile('products/store-organization/theme-change-summary.json',JSON.stringify({targetTheme:a.theme.id,role:a.theme.role,files:['templates/index.json','sections/product-recommendations.liquid'],changedHomepageSections:changes,publishTheme:false},null,2));console.log(JSON.stringify({prepared:true,changedHomepageSections:changes,files:2}));
